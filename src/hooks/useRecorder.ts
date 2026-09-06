import { useCallback, useEffect, useRef, useState } from "react";

export const MAX_RECORDING_SECONDS = 50 * 60;

export type RecorderState = "idle" | "requesting" | "recording" | "paused" | "stopped" | "denied";

export type RecorderResult = { blob: Blob; mimeType: string; duration: number };

function pickMimeType(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  if (typeof MediaRecorder === "undefined") return "";
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

export function useRecorder() {
  const [state, setState] = useState<RecorderState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef(0);
  const segmentStartRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);

  const releaseWakeLock = useCallback(() => {
    const lock = wakeLockRef.current;
    wakeLockRef.current = null;
    void lock?.release().catch(() => {});
  }, []);

  const requestWakeLock = useCallback(async () => {
    const nav = navigator as Navigator & {
      wakeLock?: { request: (type: "screen") => Promise<{ release: () => Promise<void> }> };
    };
    if (!nav.wakeLock || wakeLockRef.current) return;
    try {
      wakeLockRef.current = await nav.wakeLock.request("screen");
    } catch {
      wakeLockRef.current = null;
    }
  }, []);

  const keepAliveRef = useRef<HTMLAudioElement | null>(null);

  // A silent looping audio element keeps the tab in an "audible" state so the
  // browser does not throttle or suspend capture when the screen turns off.
  const startKeepAlive = useCallback(() => {
    if (keepAliveRef.current || typeof Audio === "undefined") return;
    try {
      const el = new Audio(
        "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=",
      );
      el.loop = true;
      el.volume = 0.0001;
      void el.play().catch(() => {});
      keepAliveRef.current = el;
    } catch {
      keepAliveRef.current = null;
    }
  }, []);

  const stopKeepAlive = useCallback(() => {
    const el = keepAliveRef.current;
    keepAliveRef.current = null;
    if (!el) return;
    try {
      el.pause();
      el.src = "";
    } catch {
      /* ignore */
    }
  }, []);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setAnalyser(null);
    void audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    releaseWakeLock();
    stopKeepAlive();
  }, [releaseWakeLock, stopKeepAlive]);

  useEffect(() => cleanup, [cleanup]);

  // Keep capture alive when the phone screen turns off or the tab is backgrounded.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      if (recorderRef.current?.state === "recording") {
        void requestWakeLock();
        startKeepAlive();
        void audioCtxRef.current?.resume().catch(() => {});
        void keepAliveRef.current?.play().catch(() => {});
      }
    };
    const onUnload = (event: BeforeUnloadEvent) => {
      if (recorderRef.current?.state !== "recording") return;
      event.preventDefault();
      event.returnValue = "";
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [requestWakeLock, startKeepAlive]);



  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    segmentStartRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const started = segmentStartRef.current ?? Date.now();
      secondsRef.current =
        accumulatedRef.current + Math.floor((Date.now() - started) / 1000);
      setSeconds(secondsRef.current);
      if (secondsRef.current >= MAX_RECORDING_SECONDS) {
        recorderRef.current?.state !== "inactive" && recorderRef.current?.stop();
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 1000);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const node = ctx.createAnalyser();
      node.fftSize = 256;
      source.connect(node);
      setAnalyser(node);

      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        audioBitsPerSecond: 24000,
      });
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => setState("stopped");
      recorder.start(1000);
      recorderRef.current = recorder;

      secondsRef.current = 0;
      accumulatedRef.current = 0;
      setSeconds(0);
      startTimer();
      void requestWakeLock();
      startKeepAlive();
      setState("recording");
    } catch (err) {
      cleanup();
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setState("denied");
        setError("Microphone access was blocked. Allow it in your browser settings to record.");
      } else if (name === "NotFoundError") {
        setState("idle");
        setError("No microphone was found on this device.");
      } else {
        setState("idle");
        setError("Recording could not start. Check your microphone and try again.");
      }
    }
  }, [cleanup, startTimer, startKeepAlive, requestWakeLock]);

  const pause = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    recorder.pause();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    accumulatedRef.current = secondsRef.current;
    segmentStartRef.current = null;
    releaseWakeLock();
    stopKeepAlive();
    setState("paused");
  }, [releaseWakeLock, stopKeepAlive]);

  const resume = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== "paused") return;
    recorder.resume();
    startTimer();
    void requestWakeLock();
    startKeepAlive();
    setState("recording");
  }, [startTimer, requestWakeLock, startKeepAlive]);

  const stop = useCallback(async (): Promise<RecorderResult | null> => {
    const recorder = recorderRef.current;
    if (!recorder) return null;

    const finished = new Promise<void>((resolve) => {
      if (recorder.state === "inactive") return resolve();
      recorder.addEventListener("stop", () => resolve(), { once: true });
    });
    if (recorder.state !== "inactive") recorder.stop();
    await finished;

    const mimeType = recorder.mimeType || "audio/webm";
    const blob = new Blob(chunksRef.current, { type: mimeType });
    const duration = secondsRef.current;
    cleanup();
    recorderRef.current = null;
    setState("stopped");

    if (blob.size === 0) return null;
    return { blob, mimeType, duration };
  }, [cleanup]);

  return { state, seconds, error, analyser, start, pause, resume, stop };
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < buffer.length; i += chunk) {
    binary += String.fromCharCode(...buffer.subarray(i, i + chunk));
  }
  return btoa(binary);
}
