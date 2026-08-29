import { cn } from "@/lib/utils";

export function ListenMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("h-5 w-5", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      <rect x="10" y="3" width="4" height="10" rx="2" />
      <path d="M6.5 11.5a5.5 5.5 0 0 0 11 0" />
      <path d="M12 17v4" />
      <path d="M3 9.5v3M21 9.5v3" opacity="0.55" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-[15px] text-foreground", className)}>
      <ListenMark className="h-[1.35em] w-[1.35em] shrink-0" />
      <span className="font-semibold tracking-[-0.03em]">
        Classear
        <span className="text-muted-foreground">.ai</span>
      </span>
    </span>
  );
}

