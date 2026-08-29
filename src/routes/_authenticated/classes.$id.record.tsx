import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { AppShell, SectionCard } from "@/components/app/AppShell";
import { Waveform } from "@/components/landing/Waveform";
import { GlassButton } from "@/components/ui/glass-button";
import { getClass } from "@/lib/classes-data";
import { processClass } from "@/lib/classes.functions";
import { blobToBase64, MAX_RECORDING_SECONDS, useRecorder } from "@/hooks/useRecorder";
import { formatDuration } from "@/lib/study-types";

export const Route = createFileRoute("/_authenticated/classes/$id/record")({
  head: () => ({
    meta: [
      { title: "Recording your class — Classear.AI" },
      {
        name: "description",
        content: "Record up to 30 minutes of class audio, or upload a recording you already have.",
      },
      { property: "og:title", content: "Recording your class — Classear.AI" },
      { property: "og:description", content: "Start listening and Classear does the rest." },
    ],
  }),
  component: RecordPage,
});

function RecordPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<"capture" | "processing">("capture");
  const recorder = useRecorder();
  const cls = useQuery({ queryKey: ["class", id], queryFn: () => getClass(id) });
  const process = useServerFn(processClass);

  const analyse = useMutation({
    mutationFn: async (input: { blob: Blob; mimeType: string; duration: number }) => {
      if (input.blob.size > 22_000_000) {
        throw new Error("That recording is too large. Keep it under about 30 minutes.");
      }
      const audioBase64 = await blobToBase64(input.blob);
      return process({
        data: {
          classId: id,
          audioBase64,
          mimeType: input.mimeType,
          duration: Math.min(input.duration, MAX_RECORDING_SECONDS),
        },
      });
    },
    onMutate: () => setPhase("processing"),
    onSuccess: (result) => {
      toast.success(result.demo ? "Notes ready (demo material)" : "Your notes are ready");
      navigate({ to: "/classes/$id", params: { id } });
    },
    onError: (error) => {
      setPhase("capture");
      toast.error(error instanceof Error ? error.message : "Analysis failed. Try again.");
    },
  });

  const isRecording = recorder.state === "recording";
  const remaining = MAX_RECORDING_SECONDS - recorder.seconds;

  return (
    <AppShell className="max-w-2xl">
      <p className="text-[12px] uppercase tracking-[0.16em] text-muted-foreground">Now recording</p>
      <h1 className="mt-2 text-[clamp(1.6rem,4vw,2.2rem)] font-semibold text-foreground">
        {cls.data?.title ?? "Your class"}
      </h1>

      <div className="mt-8 space-y-6">
        <SectionCard title={phase === "processing" ? "Analysing" : "Microphone"}>
          {phase === "processing" ? (
            <div className="space-y-4">
              <Waveform active className="h-20 w-full" />
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                Transcribing the class and writing your notes. The audio is discarded as soon as this
                finishes — only the text is kept.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <Waveform
                active={isRecording}
                analyser={recorder.analyser}
                className="h-24 w-full"
              />
              <div className="flex items-baseline justify-between">
                <span className="text-[28px] font-semibold tabular-nums text-foreground">
                  {formatDuration(recorder.seconds)}
                </span>
                <span className="text-[12px] text-muted-foreground">
                  {formatDuration(Math.max(0, remaining))} left
                </span>
              </div>

              {recorder.error ? (
                <p className="text-[13px] text-muted-foreground">{recorder.error}</p>
              ) : null}

              <div className="flex flex-wrap gap-3">
                {recorder.state === "idle" || recorder.state === "denied" ? (
                  <GlassButton size="lg" onClick={() => void recorder.start()}>
                    Start listening
                  </GlassButton>
                ) : null}
                {isRecording ? (
                  <GlassButton variant="secondary" size="lg" onClick={recorder.pause}>
                    Pause
                  </GlassButton>
                ) : null}
                {recorder.state === "paused" ? (
                  <GlassButton size="lg" onClick={recorder.resume}>
                    Resume
                  </GlassButton>
                ) : null}
                {isRecording || recorder.state === "paused" ? (
                  <GlassButton
                    variant="secondary"
                    size="lg"
                    onClick={async () => {
                      const result = await recorder.stop();
                      if (!result) {
                        toast.error("Nothing was recorded.");
                        return;
                      }
                      analyse.mutate(result);
                    }}
                  >
                    Stop &amp; analyse
                  </GlassButton>
                ) : null}
              </div>
            </div>
          )}
        </SectionCard>

        {phase === "capture" ? (
          <SectionCard title="Or upload a recording">
            <input
              ref={fileRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                analyse.mutate({
                  blob: file,
                  mimeType: file.type || "audio/mpeg",
                  duration: 0,
                });
              }}
            />
            <div className="flex flex-wrap items-center gap-3">
              <GlassButton variant="secondary" onClick={() => fileRef.current?.click()}>
                Choose audio file
              </GlassButton>
              <span className="text-[12px] text-muted-foreground">
                mp3, m4a, webm or ogg — up to about 30 minutes
              </span>
            </div>
          </SectionCard>
        ) : null}

        <p className="text-[12px] text-muted-foreground">
          Changed your mind?{" "}
          <Link to="/dashboard" className="underline">
            Back to home
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
