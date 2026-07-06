"use client";

import React, { useState, useRef, useEffect } from "react";

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob | null) => void;
}

export default function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const [status, setStatus] = useState<"idle" | "recording" | "completed">("idle");
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Timer Tick
  useEffect(() => {
    if (status === "recording") {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // Clean up resources on unmount
  useEffect(() => {
    return () => {
      stopCanvasVisualization();
      cleanupMediaStream();
    };
  }, []);

  const cleanupMediaStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Canvas visualizer logic
  const startCanvasVisualization = (stream: MediaStream) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const canvasCtx = canvas.getContext("2d");
      if (!canvasCtx) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!canvasRef.current || status !== "recording") return;
        animationFrameRef.current = requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);

        const width = canvas.width;
        const height = canvas.height;
        canvasCtx.fillStyle = "rgb(14, 17, 21)"; // matches bg-[#0e1115]
        canvasCtx.fillRect(0, 0, width, height);

        const barWidth = (width / bufferLength) * 1.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i] / 1.5;
          // Sage Green visualizer fill (91, 122, 97)
          canvasCtx.fillStyle = `rgba(91, 122, 97, ${0.3 + barHeight / 150})`;
          canvasCtx.fillRect(x, height / 2 - barHeight / 2, barWidth, barHeight);
          x += barWidth + 4;
        }
      };

      draw();
    } catch (e) {
      console.warn("Visualizer context failed to load:", e);
    }
  };

  const stopCanvasVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  const startRecording = async () => {
    setErrorMsg("");
    setRecordingTime(0);
    audioChunksRef.current = [];
    cleanupMediaStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const options = { mimeType: "audio/webm" };
      let mediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (err) {
        mediaRecorder = new MediaRecorder(stream);
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onRecordingComplete(blob);
        cleanupMediaStream();
      };

      mediaRecorderRef.current = mediaRecorder;
      setStatus("recording");
      mediaRecorder.start(250);

      setTimeout(() => startCanvasVisualization(stream), 100);
    } catch (err: any) {
      console.error("Microphone permission denied:", err);
      setErrorMsg("Microphone permission denied. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === "recording") {
      mediaRecorderRef.current.stop();
      stopCanvasVisualization();
      setStatus("completed");
    }
  };

  const resetRecording = () => {
    setStatus("idle");
    setRecordingTime(0);
    setAudioUrl(null);
    onRecordingComplete(null);
    stopCanvasVisualization();
    cleanupMediaStream();
  };

  const [errorMsg, setErrorMsg] = useState("");

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="p-6 bg-[#161a22] border border-slate-800 rounded-2xl space-y-4 max-w-md mx-auto text-center">
      <div className="flex flex-col items-center space-y-2">
        <span className="text-[10px] font-bold text-[#8fbc8f] uppercase tracking-widest bg-[#5b7a61]/10 px-2 py-0.5 rounded border border-[#5b7a61]/25">
          Acoustic Voice Module
        </span>
        <h3 className="text-base font-bold text-white uppercase tracking-tight">Speech Sample Analysis</h3>
        <p className="text-[11px] text-slate-400 max-w-[280px] leading-relaxed">
          Describe how you are feeling today out loud. Record for at least 3-5 seconds.
        </p>
      </div>

      {errorMsg && (
        <div className="text-[11px] text-rose-400 bg-rose-950/20 border border-rose-500/20 p-2.5 rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* Visual State Board */}
      <div className="relative h-24 bg-[#0e1115] rounded-xl overflow-hidden flex items-center justify-center border border-slate-800/80">
        {status === "idle" && (
          <div className="text-slate-500 flex flex-col items-center space-y-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#5b7a61]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span className="text-[9px] font-extrabold text-slate-500 tracking-wider">MICROPHONE READY</span>
          </div>
        )}

        {status === "recording" && (
          <div className="absolute inset-0 flex flex-col justify-between p-3.5 z-10 pointer-events-none">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-1.5 text-rose-500">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                <span className="text-[9px] font-bold uppercase tracking-wider">RECORDING</span>
              </div>
              <span className="text-xs font-mono font-bold text-white">{formatTime(recordingTime)}</span>
            </div>
          </div>
        )}

        {status === "recording" && (
          <canvas
            ref={canvasRef}
            className="w-full h-full object-cover rounded-xl block"
            width={350}
            height={96}
          />
        )}

        {status === "completed" && audioUrl && (
          <div className="p-3 w-full flex items-center justify-center flex-col space-y-2">
            <span className="text-[10px] font-bold text-[#8fbc8f] flex items-center gap-1">
              <svg xmlns="http://www.w3.org/255/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              RECORDING COMPILED
            </span>
            <audio src={audioUrl} controls className="h-8 max-w-full accent-[#5b7a61] rounded-lg" />
          </div>
        )}
      </div>

      {/* Button Controls */}
      <div className="flex justify-center items-center gap-3">
        {status === "idle" && (
          <button
            onClick={startRecording}
            className="px-5 py-2 bg-[#5b7a61] hover:bg-[#4b6651] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition duration-150 active:scale-[0.97]"
          >
            Start Audio Capturing
          </button>
        )}

        {status === "recording" && (
          <button
            onClick={stopRecording}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition duration-150 active:scale-[0.97]"
          >
            Stop Recording
          </button>
        )}

        {status === "completed" && (
          <button
            onClick={resetRecording}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-wider rounded-xl transition duration-150 border border-slate-750 active:scale-[0.97]"
          >
            Re-Record Voice
          </button>
        )}
      </div>
    </div>
  );
}
