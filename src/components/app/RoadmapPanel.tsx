import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { SectionCard } from "@/components/app/AppShell";
import { GlassButton } from "@/components/ui/glass-button";
import { Input } from "@/components/ui/input";
import { makeRoadmap } from "@/lib/classes.functions";
import { resourceLinks } from "@/lib/resource-links";
import type { Roadmap } from "@/lib/study-types";

export function RoadmapPanel({ classId }: { classId: string }) {
  const [topic, setTopic] = useState("");
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const build = useServerFn(makeRoadmap);

  const generate = useMutation({
    mutationFn: () => build({ data: { classId, topic: topic.trim() } }),
    onSuccess: (result) => setRoadmap(result),
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Couldn't build a roadmap right now"),
  });

  return (
    <SectionCard title="Learning roadmap">
      <div className="space-y-5">
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          Name a topic from this class and get a full study plan — a schedule, what to do at each
          step, and links to look things up.
        </p>

        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            generate.mutate();
          }}
        >
          <Input
            value={topic}
            maxLength={160}
            placeholder="e.g. neural networks, or leave blank"
            onChange={(event) => setTopic(event.target.value)}
          />
          <GlassButton type="submit" disabled={generate.isPending}>
            {generate.isPending ? "Planning…" : roadmap ? "New roadmap" : "Build roadmap"}
          </GlassButton>
        </form>

        {roadmap ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-[15px] text-foreground">{roadmap.topic}</h3>
              {roadmap.totalTime ? (
                <p className="mt-1 text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
                  {roadmap.totalTime}
                </p>
              ) : null}
              {roadmap.overview ? (
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                  {roadmap.overview}
                </p>
              ) : null}
            </div>

            <ol className="space-y-6">
              {roadmap.steps.map((step, index) => (
                <li key={index} className="border-l border-border pl-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    Step {index + 1}
                    {step.timeframe ? ` · ${step.timeframe}` : ""}
                  </p>
                  <h4 className="mt-1 text-[14px] text-foreground">{step.title}</h4>
                  {step.goal ? (
                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                      {step.goal}
                    </p>
                  ) : null}
                  {step.tasks.length > 0 ? (
                    <ul className="mt-3 space-y-2">
                      {step.tasks.map((task, i) => (
                        <li key={i} className="flex gap-3 text-[13px] leading-relaxed text-foreground">
                          <span
                            aria-hidden
                            className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground"
                          />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {(step.searchTerms.length > 0 ? step.searchTerms : [step.title]).map((term) => (
                    <div key={term} className="mt-3">
                      <p className="text-[12px] text-muted-foreground">{term}</p>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                        {resourceLinks(term, roadmap.topic).map((link) => (
                          <a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[12px] text-foreground underline underline-offset-4"
                          >
                            {link.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </li>
              ))}
            </ol>

            {roadmap.practice.length > 0 ? (
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Practice
                </p>
                <ul className="mt-2 space-y-2">
                  {roadmap.practice.map((item, i) => (
                    <li key={i} className="text-[13px] leading-relaxed text-foreground">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </SectionCard>
  );
}
