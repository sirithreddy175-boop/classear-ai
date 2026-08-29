import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { AppShell, SectionCard } from "@/components/app/AppShell";
import { ClassRow } from "@/components/app/ClassRow";
import { GlassButton } from "@/components/ui/glass-button";
import { Skeleton } from "@/components/ui/skeleton";
import { ensureDemoClass, listClasses } from "@/lib/classes-data";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your classes — Classear.AI" },
      {
        name: "description",
        content: "Start a new class recording or revisit the notes from a class you already recorded.",
      },
      { property: "og:title", content: "Your classes — Classear.AI" },
      { property: "og:description", content: "Start listening, or open a recent class." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const classes = useQuery({ queryKey: ["classes"], queryFn: listClasses });

  const demo = useMutation({
    mutationFn: ensureDemoClass,
    onSuccess: (id) => {
      void queryClient.invalidateQueries({ queryKey: ["classes"] });
      navigate({ to: "/classes/$id", params: { id } });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not open demo"),
  });

  const recent = (classes.data ?? []).slice(0, 5);

  return (
    <AppShell>
      <h1 className="text-[clamp(1.8rem,5vw,2.6rem)] font-semibold text-foreground">
        Ready for your next class?
      </h1>
      <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-muted-foreground">
        Start listening when the lecture begins. Classear handles the transcript, the notes and the
        exam prep afterwards.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <GlassButton asChild size="lg">
          <Link to="/classes/new">Start new class</Link>
        </GlassButton>
        <GlassButton
          variant="secondary"
          size="lg"
          disabled={demo.isPending}
          onClick={() => demo.mutate()}
        >
          {demo.isPending ? "Opening…" : "Open demo class"}
        </GlassButton>
      </div>

      <div className="mt-12 space-y-6">
        <SectionCard
          title="Recent classes"
          action={
            recent.length > 0 ? (
              <Link to="/classes" className="text-[13px] text-muted-foreground hover:text-foreground">
                View all
              </Link>
            ) : undefined
          }
        >
          {classes.isPending ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : classes.isError ? (
            <p className="text-[13px] text-destructive-foreground">
              Your classes couldn't be loaded.{" "}
              <button className="underline" onClick={() => classes.refetch()}>
                Retry
              </button>
            </p>
          ) : recent.length === 0 ? (
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              No classes yet. Record your first lecture, or open the demo class to see exactly what
              you get back.
            </p>
          ) : (
            <ul className="divide-y divide-border-soft">
              {recent.map((item) => (
                <ClassRow key={item.id} item={item} />
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
