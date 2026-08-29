import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, SectionCard } from "@/components/app/AppShell";
import { GlassButton } from "@/components/ui/glass-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClass } from "@/lib/classes-data";

export const Route = createFileRoute("/_authenticated/classes/new")({
  head: () => ({
    meta: [
      { title: "Start a new class — Classear.AI" },
      {
        name: "description",
        content: "Name the class you're about to record so your notes stay organised.",
      },
      { property: "og:title", content: "Start a new class — Classear.AI" },
      { property: "og:description", content: "Name your class, then start listening." },
    ],
  }),
  component: NewClassPage,
});

function NewClassPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [teacher, setTeacher] = useState("");

  const create = useMutation({
    mutationFn: () => createClass({ title, subject, teacher }),
    onSuccess: (id) => navigate({ to: "/classes/$id/record", params: { id } }),
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not create the class"),
  });

  return (
    <AppShell className="max-w-2xl">
      <h1 className="text-[clamp(1.6rem,4vw,2.2rem)] font-semibold text-foreground">
        Start a new class
      </h1>
      <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
        Give it a name now so the notes are easy to find later. You can record up to 30 minutes.
      </p>

      <form
        className="mt-8"
        onSubmit={(event) => {
          event.preventDefault();
          if (!title.trim()) {
            toast.error("Add a class title first.");
            return;
          }
          create.mutate();
        }}
      >
        <SectionCard title="Class details">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Class title</Label>
              <Input
                id="title"
                value={title}
                maxLength={120}
                placeholder="Introduction to Machine Learning"
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject (optional)</Label>
                <Input
                  id="subject"
                  value={subject}
                  maxLength={80}
                  placeholder="Computer Science"
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher">Teacher (optional)</Label>
                <Input
                  id="teacher"
                  value={teacher}
                  maxLength={80}
                  placeholder="Dr. Nair"
                  onChange={(e) => setTeacher(e.target.value)}
                />
              </div>
            </div>
          </div>
        </SectionCard>

        <div className="mt-6 flex gap-3">
          <GlassButton type="submit" size="lg" disabled={create.isPending}>
            {create.isPending ? "Creating…" : "Continue to recording"}
          </GlassButton>
        </div>
      </form>
    </AppShell>
  );
}
