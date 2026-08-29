import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell, SectionCard } from "@/components/app/AppShell";
import { ClassRow } from "@/components/app/ClassRow";
import { GlassButton } from "@/components/ui/glass-button";
import { Skeleton } from "@/components/ui/skeleton";
import { listClasses } from "@/lib/classes-data";

export const Route = createFileRoute("/_authenticated/classes/")({
  head: () => ({
    meta: [
      { title: "All classes — Classear.AI" },
      {
        name: "description",
        content: "Every class you recorded, with its notes, key points and exam questions.",
      },
      { property: "og:title", content: "All classes — Classear.AI" },
      { property: "og:description", content: "Browse your recorded classes and their study notes." },
    ],
  }),
  component: ClassesPage,
});

function ClassesPage() {
  const classes = useQuery({ queryKey: ["classes"], queryFn: listClasses });

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[clamp(1.6rem,4vw,2.2rem)] font-semibold text-foreground">Your classes</h1>
        <GlassButton asChild>
          <Link to="/classes/new">Start new class</Link>
        </GlassButton>
      </div>

      <div className="mt-8">
        <SectionCard title={`${classes.data?.length ?? 0} classes`}>
          {classes.isPending ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : classes.isError ? (
            <p className="text-[13px] text-muted-foreground">
              Your classes couldn't be loaded.{" "}
              <button className="underline" onClick={() => classes.refetch()}>
                Retry
              </button>
            </p>
          ) : (classes.data ?? []).length === 0 ? (
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Nothing here yet. Record your first class to see notes, key points and exam questions.
            </p>
          ) : (
            <ul className="divide-y divide-border-soft">
              {(classes.data ?? []).map((item) => (
                <ClassRow key={item.id} item={item} />
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
