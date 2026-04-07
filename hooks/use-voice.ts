import { useRef, useEffect, useCallback } from "react";

export const useVoice = () => {
  const recorder = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isCancelledRef = useRef<boolean>(false);

  const startRecording = useCallback(async (socket: WebSocket | null) => {
    if (typeof window === "undefined") return;
    isCancelledRef.current = false;

    try {
      // Dynamically import RecordRTC only on the client
      const { default: RecordRTC, StereoAudioRecorder } =
        await import("recordrtc");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (isCancelledRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;

      recorder.current = new RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/wav",
        recorderType: StereoAudioRecorder,
        timeSlice: 500,
        desiredSampRate: 16000,
        numberOfAudioChannels: 1,
        bufferSize: 4096,
        ondataavailable: async (blob: Blob) => {
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
    } catch (err) {
      console.error("Error stopping recorder:", err);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  return { startRecording, stopRecording };
};
