import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type WaveformProps = {
  active?: boolean;
  analyser?: AnalyserNode | null;
  bars?: number;
  className?: string;
};

/**
 * Monochrome waveform. Uses live audio data when an analyser is supplied,
 * otherwise renders a calm synthetic idle wave.
 */
export function Waveform({ active = false, analyser = null, bars = 56, className }: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const nodes = Array.from(container.children) as HTMLElement[];
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      nodes.forEach((node, i) => {
        node.style.transform = `scaleY(${0.25 + Math.abs(Math.sin(i / 3)) * 0.4})`;
      });
      return;
    }

    let frame = 0;
    let raf = 0;
    const data = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

    const tick = () => {
      frame += 1;
      if (analyser && data) {
        analyser.getByteFrequencyData(data as Uint8Array<ArrayBuffer>);
        const step = Math.floor(data.length / nodes.length) || 1;
        nodes.forEach((node, i) => {
          const v = (data[i * step] ?? 0) / 255;
          node.style.transform = `scaleY(${Math.max(0.06, Math.min(1, v * 1.5))})`;
        });
      } else {
        nodes.forEach((node, i) => {
          const base = active ? 0.5 : 0.22;
          const amp = active ? 0.5 : 0.14;
          const v =
            base +
            amp *
              Math.abs(
                Math.sin(frame / 22 + i / 4) * 0.6 + Math.sin(frame / 9 + i / 2.2) * 0.4,
              );
          node.style.transform = `scaleY(${Math.max(0.06, Math.min(1, v))})`;
        });
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, analyser, bars]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn("flex h-16 w-full items-center justify-center gap-[3px]", className)}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "w-[2px] rounded-full transition-colors duration-500",
            active ? "bg-soft" : "bg-muted-foreground/50",
          )}
          style={{ height: "100%", transformOrigin: "center", willChange: "transform" }}
        />
      ))}
    </div>
  );
}
