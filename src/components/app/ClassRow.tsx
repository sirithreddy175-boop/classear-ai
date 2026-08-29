import { Link } from "@tanstack/react-router";

import { CLASS_STATUS_LABEL, formatDuration, type ClassRecord } from "@/lib/study-types";

export function ClassRow({ item }: { item: ClassRecord }) {
  return (
    <li>
      <Link
        to="/classes/$id"
        params={{ id: item.id }}
        className="flex items-center justify-between gap-4 py-4 transition-opacity hover:opacity-80"
      >
        <span className="min-w-0">
          <span className="block truncate text-[15px] text-foreground">{item.title}</span>
          <span className="mt-1 block truncate text-[12px] text-muted-foreground">
            {[item.subject, item.teacher].filter(Boolean).join(" · ") || "No subject"}
            {item.is_demo ? " · Demo" : ""}
          </span>
        </span>
        <span className="shrink-0 text-right text-[12px] text-muted-foreground">
          <span className="block">{CLASS_STATUS_LABEL[item.status] ?? item.status}</span>
          <span className="block tabular-nums">{formatDuration(item.duration)}</span>
        </span>
      </Link>
    </li>
  );
}
