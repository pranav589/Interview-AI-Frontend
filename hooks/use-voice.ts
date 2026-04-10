import { useRef, useEffect, useCallback, useState } from "react";

export const useVoice = () => {
  const recorder = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isCancelledRef = useRef<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const lastVoiceTimeRef = useRef<number>(0);
  const [volume, setVolume] = useState(0);

  const startRecording = useCallback(async (socket: WebSocket | null) => {
    if (typeof window === "undefined") return;
    isCancelledRef.current = false;

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
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const audioContext = new AudioContextClass();
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

        // Lowered threshold to 0.005 for better sensitivity
        if (rms > 0.005) {
          lastVoiceTimeRef.current = Date.now();
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
          // Check if there was any voice activity recently (within lead-out buffer)
          // Since timeSlice is 500ms, a chunk might start 500ms ago.
          // We allow 300ms of lead-out after last detected voice.
          const now = Date.now();
          const timeSinceLastVoice = now - lastVoiceTimeRef.current;
          
          if (timeSinceLastVoice > 550) { // 250ms chunk duration + 300ms lead-out
            return;
          }

          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result;
            if (typeof result === "string") {
              const splitResult = result.split(",");
              const base64data = splitResult.slice(1).join(",");

              if (
                base64data &&
                socket &&
                socket.readyState === WebSocket.OPEN
              ) {
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
      // Parent component handles errors now
    }
  }, []);

  const stopRecording = useCallback(() => {
    isCancelledRef.current = true;
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
    } catch (err) {
      console.error("Error stopping recorder:", err);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  return { startRecording, stopRecording, volume };
};
