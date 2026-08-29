import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, SectionCard } from "@/components/app/AppShell";
import { GlassButton } from "@/components/ui/glass-button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteClass, getClass, getMaterial, listConversation } from "@/lib/classes-data";
import { askClass } from "@/lib/classes.functions";
import { CLASS_STATUS_LABEL, formatDuration } from "@/lib/study-types";

export const Route = createFileRoute("/_authenticated/classes/$id/")({
  head: () => ({
    meta: [
      { title: "Class notes — Classear.AI" },
      {
        name: "description",
        content:
          "Summary, key points, concepts, exam questions and revision notes from your recorded class.",
      },
      { property: "og:title", content: "Class notes — Classear.AI" },
      { property: "og:description", content: "Everything your class covered, in one place." },
    ],
  }),
  component: ClassDetailPage,
});

function Bullets({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-[13px] text-muted-foreground">Nothing recorded for this section.</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3 text-[14px] leading-relaxed text-foreground">
          <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ClassDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [question, setQuestion] = useState("");

  const cls = useQuery({ queryKey: ["class", id], queryFn: () => getClass(id) });
  const material = useQuery({ queryKey: ["material", id], queryFn: () => getMaterial(id) });
  const chat = useQuery({ queryKey: ["conversation", id], queryFn: () => listConversation(id) });
  const ask = useServerFn(askClass);

  const askMutation = useMutation({
    mutationFn: (q: string) => ask({ data: { classId: id, question: q } }),
    onSuccess: () => {
      setQuestion("");
      void queryClient.invalidateQueries({ queryKey: ["conversation", id] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Couldn't answer that right now"),
  });

  const remove = useMutation({
    mutationFn: () => deleteClass(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Class deleted");
      navigate({ to: "/classes" });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not delete this class"),
  });

  if (cls.isPending) {
    return (
      <AppShell>
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-6 h-40 w-full" />
      </AppShell>
    );
  }

  if (cls.isError || !cls.data) {
    return (
      <AppShell>
        <h1 className="text-2xl font-semibold text-foreground">Class not found</h1>
        <p className="mt-3 text-[14px] text-muted-foreground">
          It may have been deleted.{" "}
          <Link to="/classes" className="underline">
            Back to your classes
          </Link>
        </p>
      </AppShell>
    );
  }

  const data = cls.data;
  const m = material.data;

  return (
    <AppShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[12px] uppercase tracking-[0.16em] text-muted-foreground">
            {CLASS_STATUS_LABEL[data.status] ?? data.status}
            {data.is_demo ? " · Demo material" : ""}
          </p>
          <h1 className="mt-2 text-[clamp(1.6rem,4vw,2.2rem)] font-semibold text-foreground">
            {data.title}
          </h1>
          <p className="mt-2 text-[13px] text-muted-foreground">
            {[data.subject, data.teacher].filter(Boolean).join(" · ") || "No subject"} ·{" "}
            {formatDuration(data.duration)}
          </p>
        </div>
        <div className="flex gap-3">
          {data.status !== "ready" ? (
            <GlassButton asChild>
              <Link to="/classes/$id/record" params={{ id }}>
                Record this class
              </Link>
            </GlassButton>
          ) : null}
          <GlassButton
            variant="ghost"
            disabled={remove.isPending}
            onClick={() => remove.mutate()}
          >
            Delete
          </GlassButton>
        </div>
      </div>

      {data.status !== "ready" ? (
        <p className="mt-8 text-[14px] leading-relaxed text-muted-foreground">
          This class hasn't been recorded yet. Start listening and the notes appear here afterwards.
        </p>
      ) : (
        <div className="mt-10 space-y-6">
          <SectionCard title="Summary">
            <p className="text-[15px] leading-relaxed text-foreground">
              {data.summary ?? "No summary was generated."}
            </p>
          </SectionCard>

          {material.isPending ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <>
              <SectionCard title="Key points">
                <Bullets items={m?.keyPoints ?? []} />
              </SectionCard>

              <SectionCard title="Concepts explained">
                {(m?.concepts ?? []).length === 0 ? (
                  <p className="text-[13px] text-muted-foreground">No concepts extracted.</p>
                ) : (
                  <div className="space-y-5">
                    {(m?.concepts ?? []).map((concept, index) => (
                      <div key={index}>
                        <h3 className="text-[15px] text-foreground">{concept.name}</h3>
                        <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                          {concept.explanation}
                        </p>
                        {concept.teacherExplanation ? (
                          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                            In class: {concept.teacherExplanation}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Examples used">
                <Bullets items={m?.examples ?? []} />
              </SectionCard>

              <SectionCard title="Important notes">
                <Bullets items={m?.importantNotes ?? []} />
              </SectionCard>

              <SectionCard title="Possible exam questions">
                {(m?.questions ?? []).length === 0 ? (
                  <p className="text-[13px] text-muted-foreground">No questions generated.</p>
                ) : (
                  <ol className="space-y-5">
                    {(m?.questions ?? []).map((q, index) => (
                      <li key={index}>
                        <p className="text-[14px] leading-relaxed text-foreground">
                          {index + 1}. {q.question}
                        </p>
                        {q.options && q.options.length > 0 ? (
                          <ul className="mt-2 space-y-1">
                            {q.options.map((option, i) => (
                              <li key={i} className="text-[13px] text-muted-foreground">
                                {option}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                        <p className="mt-2 text-[13px] text-muted-foreground">Answer: {q.answer}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </SectionCard>

              <SectionCard title="Revision notes">
                <Bullets items={m?.revisionNotes ?? []} />
              </SectionCard>

              <SectionCard title="What to study next">
                {(m?.resources ?? []).length === 0 ? (
                  <p className="text-[13px] text-muted-foreground">No suggestions yet.</p>
                ) : (
                  <ul className="space-y-4">
                    {(m?.resources ?? []).map((resource, index) => (
                      <li key={index}>
                        <p className="text-[14px] text-foreground">
                          {resource.title}{" "}
                          <span className="text-[12px] text-muted-foreground">({resource.kind})</span>
                        </p>
                        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                          {resource.why}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>
            </>
          )}

          <SectionCard title="Ask this class">
            <div className="space-y-4">
              {(chat.data ?? []).length > 0 ? (
                <ul className="space-y-4">
                  {(chat.data ?? []).map((message) => (
                    <li key={message.id}>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        {message.role === "user" ? "You" : "Classear"}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-[14px] leading-relaxed text-foreground">
                        {message.content}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  Ask anything about this class — answers come only from what was actually said.
                </p>
              )}

              <form
                className="flex flex-col gap-3 sm:flex-row"
                onSubmit={(event) => {
                  event.preventDefault();
                  const q = question.trim();
                  if (q.length < 2) return;
                  askMutation.mutate(q);
                }}
              >
                <Input
                  value={question}
                  maxLength={1000}
                  placeholder="What did the teacher say about overfitting?"
                  onChange={(e) => setQuestion(e.target.value)}
                />
                <GlassButton type="submit" disabled={askMutation.isPending}>
                  {askMutation.isPending ? "Thinking…" : "Ask"}
                </GlassButton>
              </form>
            </div>
          </SectionCard>

          <SectionCard title="Transcript">
            <p className="max-h-80 overflow-y-auto whitespace-pre-wrap text-[13px] leading-relaxed text-muted-foreground">
              {data.transcript ?? "No transcript stored."}
            </p>
          </SectionCard>
        </div>
      )}
    </AppShell>
  );
}
