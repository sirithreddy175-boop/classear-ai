import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  analyzeLecture,
  answerFromLecture,
  generateQuiz,
  generateRoadmap,
  transcribeLecture,
} from "./ai.server";

export const processClass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        classId: z.string().uuid(),
        audioBase64: z.string().min(1).max(50_000_000),
        mimeType: z.string().min(3).max(80),
        duration: z.number().int().min(0).max(3600),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: cls, error: loadError } = await supabase
      .from("classes")
      .select("id, title, subject")
      .eq("id", data.classId)
      .single();
    if (loadError || !cls) throw new Error("Class not found");

    const { transcript, demo: transcriptDemo } = await transcribeLecture(
      data.audioBase64,
      data.mimeType,
    );
    const { material, demo: materialDemo } = await analyzeLecture(
      transcript,
      cls.title,
      cls.subject,
    );

    const demo = transcriptDemo || materialDemo;

    const { error: updateError } = await supabase
      .from("classes")
      .update({
        transcript,
        summary: material.summary,
        duration: data.duration,
        status: "ready",
        ended_at: new Date().toISOString(),
        is_demo: demo,
        audio_url: null,
      })
      .eq("id", data.classId);
    if (updateError) throw new Error(updateError.message);

    const { error: materialError } = await supabase.from("learning_material").upsert(
      {
        class_id: data.classId,
        user_id: userId,
        key_points: material.keyPoints,
        concepts: material.concepts,
        examples: material.examples,
        important_notes: material.importantNotes,
        questions: material.questions,
        revision_notes: material.revisionNotes,
        resources: material.resources,
      },
      { onConflict: "class_id" },
    );
    if (materialError) throw new Error(materialError.message);

    return { demo };
  });

export const askClass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        classId: z.string().uuid(),
        question: z.string().trim().min(2).max(1000),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: cls, error } = await supabase
      .from("classes")
      .select("id, title, transcript")
      .eq("id", data.classId)
      .single();
    if (error || !cls) throw new Error("Class not found");
    if (!cls.transcript) throw new Error("This class has no transcript yet.");

    const answer = await answerFromLecture(cls.transcript, cls.title, data.question);

    await supabase.from("conversations").insert([
      { class_id: data.classId, user_id: userId, role: "user", content: data.question },
      { class_id: data.classId, user_id: userId, role: "assistant", content: answer },
    ]);

    return { answer };
  });

export const makeQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        classId: z.string().uuid(),
        topic: z.string().trim().max(160).optional().default(""),
        count: z.number().int().min(3).max(10).optional().default(5),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { data: cls, error } = await supabase
      .from("classes")
      .select("id, title, transcript")
      .eq("id", data.classId)
      .single();
    if (error || !cls) throw new Error("Class not found");
    if (!cls.transcript) throw new Error("This class has no transcript yet.");

    const { quiz } = await generateQuiz(cls.transcript, cls.title, data.topic, data.count);
    if (!quiz) throw new Error("Could not build a quiz right now. Try again in a moment.");
    return quiz;
  });

export const makeRoadmap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        classId: z.string().uuid(),
        topic: z.string().trim().max(160).optional().default(""),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { data: cls, error } = await supabase
      .from("classes")
      .select("id, title, transcript")
      .eq("id", data.classId)
      .single();
    if (error || !cls) throw new Error("Class not found");
    if (!cls.transcript) throw new Error("This class has no transcript yet.");

    const { roadmap } = await generateRoadmap(cls.transcript, cls.title, data.topic);
    if (!roadmap) throw new Error("Could not build a roadmap right now. Try again in a moment.");
    return roadmap;
  });
