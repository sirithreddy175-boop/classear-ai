import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { SectionCard } from "@/components/app/AppShell";
import { GlassButton } from "@/components/ui/glass-button";
import { Input } from "@/components/ui/input";
import { makeQuiz } from "@/lib/classes.functions";
import type { Quiz } from "@/lib/study-types";

export function QuizPanel({ classId }: { classId: string }) {
  const [topic, setTopic] = useState("");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const build = useServerFn(makeQuiz);

  const generate = useMutation({
    mutationFn: () => build({ data: { classId, topic: topic.trim(), count: 5 } }),
    onSuccess: (result) => {
      setQuiz(result);
      setAnswers({});
      setSubmitted(false);
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Couldn't build a quiz right now"),
  });

  const score = quiz
    ? quiz.questions.reduce((acc, q, i) => (answers[i] === q.answerIndex ? acc + 1 : acc), 0)
    : 0;

  return (
    <SectionCard title="Quiz yourself">
      <div className="space-y-5">
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          Name a topic from this class — or leave it blank for the whole class — and get five
          multiple-choice questions built only from what was said.
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
            placeholder="e.g. overfitting, or leave blank"
            onChange={(event) => setTopic(event.target.value)}
          />
          <GlassButton type="submit" disabled={generate.isPending}>
            {generate.isPending ? "Building…" : quiz ? "New quiz" : "Generate quiz"}
          </GlassButton>
        </form>

        {quiz ? (
          <div className="space-y-6">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {quiz.topic}
            </p>

            {quiz.questions.map((q, index) => {
              const chosen = answers[index];
              return (
                <div key={index} className="space-y-3">
                  <p className="text-[14px] leading-relaxed text-foreground">
                    {index + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((option, optionIndex) => {
                      const isChosen = chosen === optionIndex;
                      const isCorrect = optionIndex === q.answerIndex;
                      const reveal = submitted && (isChosen || isCorrect);
                      return (
                        <button
                          key={optionIndex}
                          type="button"
                          disabled={submitted}
                          onClick={() =>
                            setAnswers((prev) => ({ ...prev, [index]: optionIndex }))
                          }
                          className={[
                            "w-full rounded-xl border px-4 py-3 text-left text-[13px] transition-colors",
                            isChosen
                              ? "border-foreground/40 bg-foreground/10 text-foreground"
                              : "border-border/60 text-muted-foreground hover:text-foreground",
                            reveal
                              ? isCorrect
                                ? "border-foreground/70 text-foreground"
                                : "opacity-60"
                              : "",
                          ].join(" ")}
                        >
                          {option}
                          {reveal && isCorrect ? " ✓" : ""}
                        </button>
                      );
                    })}
                  </div>
                  {submitted && q.explanation ? (
                    <p className="text-[12px] leading-relaxed text-muted-foreground">
                      {q.explanation}
                    </p>
                  ) : null}
                </div>
              );
            })}

            <div className="flex flex-wrap items-center gap-4">
              {submitted ? (
                <>
                  <p className="text-[14px] text-foreground">
                    You scored {score} of {quiz.questions.length}
                  </p>
                  <GlassButton
                    variant="secondary"
                    onClick={() => {
                      setAnswers({});
                      setSubmitted(false);
                    }}
                  >
                    Try again
                  </GlassButton>
                </>
              ) : (
                <GlassButton
                  disabled={Object.keys(answers).length < quiz.questions.length}
                  onClick={() => setSubmitted(true)}
                >
                  Check answers
                </GlassButton>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </SectionCard>
  );
}
