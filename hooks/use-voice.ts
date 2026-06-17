import { useRef, useEffect, useCallback, useState } from "react";

// Align with backend TranscriptionProvider minTurnSilence (2000ms) + buffer.
// We keep audio flowing for 8s of silence so AssemblyAI never sees a gap and force-finalizes early.
const THINKING_PAUSE_MS = 6000;
const SILENCE_SEND_INTERVAL_MS = 500; // send a keepalive chunk every 500ms during silence

// 3200 bytes of silence at 16kHz mono = 100ms of audio.
// Meets AssemblyAI's minimum chunk duration requirement (50ms - 1000ms).
const SILENCE_KEEPALIVE_BASE64 =
  typeof window !== "undefined" ? btoa("\0".repeat(3200)) : "";

export const useVoice = (
  // Accept a MutableRefObject instead of a direct socket value so we always
  // read the current socket even after reconnects, without re-instantiating the recorder.
  socketRef: React.MutableRefObject<WebSocket | null>,
  options: { isMuted?: boolean } = {},
) => {
  const recorder = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isCancelledRef = useRef<boolean>(false);
  const isMutedRef = useRef<boolean>(options.isMuted || false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const lastVoiceTimeRef = useRef<number>(Date.now());
  const lastSilenceSendAtRef = useRef<number>(0);
  const isSilentSentRef = useRef<boolean>(true);

  // Ref-based AI-speaking guard, controlled imperatively by the parent component
  // via `setAISpeaking`. Avoids the React re-render lag that caused the echo-loop race.
  const isAISpeakingRef = useRef<boolean>(false);
  const isRecordingRef = useRef<boolean>(false);

  const [volume, setVolume] = useState(0);

  useEffect(() => {
    isMutedRef.current = options.isMuted || false;
  }, [options.isMuted]);

  //  Expose an imperative setter so the parent can synchronously block/unblock audio
  // at the exact moment audio playback starts/ends, without going through a React re-render.
  const setAISpeaking = useCallback((speaking: boolean) => {
    isAISpeakingRef.current = speaking;
  }, []);

  const startRecording = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (isRecordingRef.current) {
      console.warn(
        "[VOICE] startRecording called while already recording. Ignoring.",
      );
      return;
    }
    isRecordingRef.current = true;
    isCancelledRef.current = false;
    lastVoiceTimeRef.current = Date.now();
    isSilentSentRef.current = true;

    try {
      // Dynamically import RecordRTC only on the client
      const { default: RecordRTC, StereoAudioRecorder } =
        await import("recordrtc");

      const audioConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
        sampleRate: 16000,
      };

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
      });

      if (isCancelledRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;

      // --- VAD Setup ---
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();

      // Auto-resume if suspended by browser autoplay policy
      if (audioContext.state === "suspended") {
        await audioContext.resume().catch((err) => {
          console.warn("[VAD] Failed to resume AudioContext:", err);
        });
      }

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (isCancelledRef.current || !analyserRef.current) return;

        analyserRef.current.getByteTimeDomainData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = (dataArray[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / bufferLength);

        // Update real-time volume state for UI
        setVolume(Math.min(100, rms * 500));

        if (rms > 0.015) {
          const now = Date.now();
          const timeSinceLast = now - lastVoiceTimeRef.current;

          if (isSilentSentRef.current) {
            isSilentSentRef.current = false;
            const socket = socketRef.current;
            if (socket && socket.readyState === WebSocket.OPEN && !isAISpeakingRef.current && !isMutedRef.current) {
              socket.send(JSON.stringify({ type: "user_speaking" }));
            }
          } else if (
            timeSinceLast > 1200 &&
            !isAISpeakingRef.current &&
            !isMutedRef.current
          ) {
            const socket = socketRef.current;
            if (socket && socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: "user_speaking" }));
            }
          }

          lastVoiceTimeRef.current = now;
        } else {
          if (!isSilentSentRef.current && Date.now() - lastVoiceTimeRef.current > 1000) {
            isSilentSentRef.current = true;
            const socket = socketRef.current;
            if (socket && socket.readyState === WebSocket.OPEN && !isAISpeakingRef.current && !isMutedRef.current) {
              socket.send(JSON.stringify({ type: "user_silent" }));
            }
          }
        }

        requestAnimationFrame(checkVolume);
      };
      checkVolume();
      // -----------------

      recorder.current = new RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/wav",
        recorderType: StereoAudioRecorder,
        timeSlice: 250,
        desiredSampRate: 16000,
        numberOfAudioChannels: 1,
        bufferSize: 4096,
        ondataavailable: async (blob: Blob) => {
          // BUG-01: Block mic when AI is speaking (ref-based, synchronous guard)
          if (isAISpeakingRef.current) return;

          // BUG-01: Also respect the mute toggle
          if (isMutedRef.current) return;

          // BUG-05: Always read socket from the ref so reconnects work seamlessly
          const socket = socketRef.current;
          if (!socket || socket.readyState !== WebSocket.OPEN) return;

          const now = Date.now();
          const timeSinceLastVoice = now - lastVoiceTimeRef.current;

          // Safety check: If AudioContext is not running, do NOT discard any audio chunks
          // to prevent browser policies or quiet levels from silencing candidate's speech.
          const isAudioContextActive =
            audioContextRef.current &&
            audioContextRef.current.state === "running";

          // Stop sending after THINKING_PAUSE_MS of silence (10s)
          // During the silence window (0.8s–10s) send a keepalive every 500ms
          // to prevent AssemblyAI from closing the session prematurely.
          if (isAudioContextActive && timeSinceLastVoice > THINKING_PAUSE_MS)
            return;

          // Only switch to silence keepalive if paused for > 4000ms (after the AAI 3500ms window).
          // Keepalive must start AFTER minTurnSilence so fake PCM never interferes with
          // AAI's own mid-sentence pause detection.
          const isSilenceKeepalive = timeSinceLastVoice > 2000;
          if (isSilenceKeepalive) {
            const sinceLastSilenceSend = now - lastSilenceSendAtRef.current;
            if (sinceLastSilenceSend < SILENCE_SEND_INTERVAL_MS) return;
            lastSilenceSendAtRef.current = now;

            // Send raw PCM silence instead of stopping the stream, keeping
            // AssemblyAI's session alive and preventing premature turn finalization.
            socket.send(
              JSON.stringify({
                type: "audio",
                chunk: SILENCE_KEEPALIVE_BASE64,
              }),
            );
            return;
          }

          // Normal audio: read blob and send
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result;
            if (typeof result === "string") {
              const splitResult = result.split(",");
              const base64data = splitResult.slice(1).join(",");

              if (base64data && socket.readyState === WebSocket.OPEN) {
                socket.send(
                  JSON.stringify({ type: "audio", chunk: base64data }),
                );
              }
            }
          };
          reader.readAsDataURL(blob);
        },
      });

      recorder.current.startRecording();
    } catch (err) {
      console.error("Microphone access failed:", err);
      isRecordingRef.current = false;
    }
  }, [socketRef]);

  const stopRecording = useCallback(() => {
    isCancelledRef.current = true;
    isRecordingRef.current = false;
    try {
      if (recorder.current) {
        recorder.current.stopRecording();
        recorder.current.destroy();
        recorder.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      analyserRef.current = null;
      lastSilenceSendAtRef.current = 0;
      isAISpeakingRef.current = false;
    } catch (err) {
      console.error("Error stopping recorder:", err);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  return { startRecording, stopRecording, volume, setAISpeaking };
};
