import { cn } from "@/lib/utils";

const LAYERS = [
  { d: "M0 160 C 220 80, 420 240, 640 160 S 1060 80, 1280 160", opacity: 1, width: 2.4, dur: "18s" },
  { d: "M0 174 C 200 116, 460 228, 660 168 S 1080 104, 1280 178", opacity: 0.8, width: 2, dur: "24s" },
  { d: "M0 146 C 260 214, 440 96, 700 152 S 1040 212, 1280 140", opacity: 0.6, width: 1.6, dur: "30s" },
  { d: "M0 188 C 240 148, 500 204, 720 178 S 1100 148, 1280 192", opacity: 0.42, width: 1.3, dur: "36s" },
  { d: "M0 132 C 280 176, 520 108, 760 148 S 1120 186, 1280 128", opacity: 0.3, width: 1.1, dur: "42s" },
];

/**
 * Atmospheric silver waveform background. Pure SVG + CSS, decorative only.
 */
export function WaveBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 50% at 50% 58%, rgba(255,255,255,0.14), transparent 72%)",
        }}
      />
      <svg
        viewBox="0 0 1280 320"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-1/2 h-[64%] w-full -translate-y-1/2"
      >
        <defs>
          <filter id="wave-glow" x="-20%" y="-80%" width="140%" height="260%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {LAYERS.map((layer) => (
          <path
            key={layer.d}
            d={layer.d}
            fill="none"
            stroke="rgba(255,255,255,0.98)"
            strokeWidth={layer.width}
            strokeOpacity={layer.opacity}
            vectorEffect="non-scaling-stroke"
            filter="url(#wave-glow)"
            className="wave-drift"
            style={{ animationDuration: layer.dur }}
          />
        ))}
      </svg>
    </div>
  );
}
