import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { GlassButton } from "@/components/ui/glass-button";
import { getFirstName } from "@/lib/greeting";
import { ensureDemoClass } from "@/lib/classes-data";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({
    meta: [
      { title: "Open Classear.AI — start a class or try the demo" },
      {
        name: "description",
        content:
          "Choose how to begin: record a live class and get structured study material, or open a sample lecture already turned into notes.",
      },
      { property: "og:title", content: "Open Classear.AI" },
      {
        property: "og:description",
        content: "Start listening to a class, or explore the demo class results.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AppEntry,
});

function MicIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      <rect x="10" y="3" width="4" height="10" rx="2" />
      <path d="M6.5 11.5a5.5 5.5 0 0 0 11 0" />
      <path d="M12 17v4" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      <path d="M12 3.5 13.6 9l5.4 1.6-5.4 1.6L12 17.7l-1.6-5.5L5 10.6 10.4 9 12 3.5Z" />
      <path d="M18.5 16.5l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z" opacity="0.6" />
    </svg>
  );
}

function AppEntry() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const name = useQuery({ queryKey: ["first-name"], queryFn: getFirstName });

  const demo = useMutation({
    mutationFn: ensureDemoClass,
    onSuccess: (id) => {
      void queryClient.invalidateQueries({ queryKey: ["classes"] });
      navigate({ to: "/classes/$id", params: { id } });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not open demo"),
  });

  return (
    <AppShell>
      <p className="reveal-1 text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
        Hi {name.data ?? "there"} — what's up?
      </p>
      <h1 className="reveal-1 mt-3 text-[clamp(1.9rem,7vw,2.9rem)] font-semibold tracking-[-0.035em] text-foreground">
        Ready for your next class?
      </h1>
      <p className="reveal-1 mt-3 text-[14px] leading-[1.6] text-muted-foreground" style={{ animationDelay: "120ms" }}>
        Choose how you want to begin.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Panel
          delay="200ms"
          icon={<MicIcon />}
          kicker="Start listening"
          title="Start Listening"
          body="Record your class and let Classear turn it into structured study material."
          action={
            <GlassButton asChild block>
              <Link to="/classes/new">Start Listening →</Link>
            </GlassButton>
          }
        />
        <Panel
          delay="300ms"
          icon={<SparkIcon />}
          kicker="Demo class"
          title="Demo Class"
          body="See how Classear transforms a sample lecture into notes, concepts, questions, and resources."
          action={
            <GlassButton
              variant="secondary"
              block
              disabled={demo.isPending}
              onClick={() => demo.mutate()}
            >
              {demo.isPending ? "Opening…" : "Try Demo Class →"}
            </GlassButton>
          }
        />
      </div>

      <p className="mt-10 text-[13px] text-muted-foreground">
        Looking for something you already recorded?{" "}
        <Link to="/classes" className="text-foreground underline underline-offset-4">
          View your classes
        </Link>
        .
      </p>
    </AppShell>
  );
}

function Panel({
  icon,
  kicker,
  title,
  body,
  action,
  delay,
}: {
  icon: React.ReactNode;
  kicker: string;
  title: string;
  body: string;
  action: React.ReactNode;
  delay: string;
}) {
  return (
    <section
      className="reveal-1 panel flex flex-col justify-between gap-8 rounded-[10px] p-7"
      style={{ animationDelay: delay }}
    >
      <div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-foreground">
            {icon}
          </span>
          <span className="text-[10.5px] uppercase tracking-[0.2em]">{kicker}</span>
        </div>
        <h2 className="mt-5 text-[20px] font-medium tracking-[-0.02em] text-foreground">{title}</h2>
        <p className="mt-2 max-w-[42ch] text-[13.5px] leading-[1.6] text-muted-foreground">
          {body}
        </p>
      </div>
      {action}
    </section>
  );
}
