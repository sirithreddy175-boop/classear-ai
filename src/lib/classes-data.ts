import { supabase } from "@/integrations/supabase/client";
import {
  DEMO_CLASS_SUBJECT,
  DEMO_CLASS_TEACHER,
  DEMO_CLASS_TITLE,
  DEMO_DURATION_SECONDS,
  DEMO_MATERIAL,
  DEMO_TRANSCRIPT,
} from "./demo-lecture";
import type { ClassRecord, StudyMaterial } from "./study-types";

const CLASS_COLUMNS =
  "id, title, subject, teacher, started_at, ended_at, duration, status, transcript, summary, is_demo, created_at";

export async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("You need to be signed in.");
  return data.user.id;
}

export async function listClasses(): Promise<ClassRecord[]> {
  const { data, error } = await supabase
    .from("classes")
    .select(CLASS_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ClassRecord[];
}

export async function getClass(id: string): Promise<ClassRecord | null> {
  const { data, error } = await supabase
    .from("classes")
    .select(CLASS_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as ClassRecord | null) ?? null;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

export async function getMaterial(classId: string): Promise<StudyMaterial | null> {
  const { data, error } = await supabase
    .from("learning_material")
    .select("key_points, concepts, examples, important_notes, questions, revision_notes, resources")
    .eq("class_id", classId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    summary: "",
    keyPoints: toStringArray(data.key_points),
    concepts: (Array.isArray(data.concepts) ? data.concepts : []) as StudyMaterial["concepts"],
    examples: toStringArray(data.examples),
    importantNotes: toStringArray(data.important_notes),
    questions: (Array.isArray(data.questions) ? data.questions : []) as StudyMaterial["questions"],
    revisionNotes: toStringArray(data.revision_notes),
    resources: (Array.isArray(data.resources) ? data.resources : []) as StudyMaterial["resources"],
  };
}

export type ChatMessage = { id: string; role: string; content: string; created_at: string };

export async function listConversation(classId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("id, role, content, created_at")
    .eq("class_id", classId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as ChatMessage[];
}

export async function createClass(input: {
  title: string;
  subject: string;
  teacher: string;
}): Promise<string> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("classes")
    .insert({
      user_id: userId,
      title: input.title.trim(),
      subject: input.subject.trim() || null,
      teacher: input.teacher.trim() || null,
      status: "draft",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function renameClass(id: string, title: string) {
  const { error } = await supabase.from("classes").update({ title: title.trim() }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteClass(id: string) {
  const { error } = await supabase.from("classes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Creates (or reuses) the labelled sample class so the whole journey works instantly. */
export async function ensureDemoClass(): Promise<string> {
  const userId = await requireUserId();

  const { data: existing } = await supabase
    .from("classes")
    .select("id")
    .eq("is_demo", true)
    .limit(1)
    .maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("classes")
    .insert({
      user_id: userId,
      title: DEMO_CLASS_TITLE,
      subject: DEMO_CLASS_SUBJECT,
      teacher: DEMO_CLASS_TEACHER,
      duration: DEMO_DURATION_SECONDS,
      status: "ready",
      is_demo: true,
      transcript: DEMO_TRANSCRIPT,
      summary: DEMO_MATERIAL.summary,
      started_at: new Date().toISOString(),
      ended_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const { error: materialError } = await supabase.from("learning_material").insert({
    class_id: data.id,
    user_id: userId,
    key_points: DEMO_MATERIAL.keyPoints,
    concepts: DEMO_MATERIAL.concepts,
    examples: DEMO_MATERIAL.examples,
    important_notes: DEMO_MATERIAL.importantNotes,
    questions: DEMO_MATERIAL.questions,
    revision_notes: DEMO_MATERIAL.revisionNotes,
    resources: DEMO_MATERIAL.resources,
  });
  if (materialError) throw new Error(materialError.message);

  return data.id;
}
