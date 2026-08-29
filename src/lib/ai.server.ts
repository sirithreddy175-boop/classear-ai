import { DEMO_MATERIAL, DEMO_TRANSCRIPT } from "./demo-lecture";
import type { StudyMaterial } from "./study-types";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

type Message = {
  role: "system" | "user";
  content: unknown;
};

async function chat(messages: Message[], expectJson: boolean): Promise<string | null> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) return null;

  try {
    const res = await fetch(GATEWAY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        ...(expectJson ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    if (!res.ok) {
      console.error("[ai] gateway error", res.status, (await res.text()).slice(0, 400));
      return null;
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return json.choices?.[0]?.message?.content ?? null;
  } catch (error) {
    console.error("[ai] gateway request failed", error);
    return null;
  }
}

function parseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(cleaned.slice(start, end + 1)) as T;
    } catch {
      return null;
    }
  }
}

export type TranscriptionResult = { transcript: string; demo: boolean };

export async function transcribeLecture(
  audioBase64: string,
  mimeType: string,
): Promise<TranscriptionResult> {
  const format = mimeType.includes("mp4")
    ? "mp4"
    : mimeType.includes("mpeg")
      ? "mp3"
      : mimeType.includes("ogg")
        ? "ogg"
        : "webm";

  const raw = await chat(
    [
      {
        role: "system",
        content:
          "You transcribe classroom lecture audio. Return only the spoken words as plain text, with [HH:MM:SS] timestamps roughly every paragraph. Do not summarise, do not add commentary.",
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Transcribe this class recording." },
          { type: "input_audio", input_audio: { data: audioBase64, format } },
        ],
      },
    ],
    false,
  );

  const transcript = raw?.trim();
  if (!transcript || transcript.length < 40) {
    return { transcript: DEMO_TRANSCRIPT, demo: true };
  }
  return { transcript, demo: false };
}

const MATERIAL_SHAPE = `{
  "summary": string,
  "keyPoints": string[],
  "concepts": [{ "name": string, "explanation": string, "teacherExplanation": string }],
  "examples": string[],
  "importantNotes": string[],
  "questions": [{ "type": "short" | "conceptual" | "mcq", "question": string, "options": string[], "answer": string }],
  "revisionNotes": string[],
  "resources": [{ "title": string, "kind": string, "why": string }]
}`;

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

export async function analyzeLecture(
  transcript: string,
  title: string,
  subject: string | null,
): Promise<{ material: StudyMaterial; demo: boolean }> {
  const raw = await chat(
    [
      {
        role: "system",
        content:
          "You are a study companion that turns one class transcript into structured study material. Use only what the transcript contains — never invent facts, and never invent URLs. For resources, suggest topics or kinds of material to look up. Reply with JSON only, matching this shape exactly: " +
          MATERIAL_SHAPE,
      },
      {
        role: "user",
        content: `Class title: ${title}\nSubject: ${subject ?? "unspecified"}\n\nTranscript:\n${transcript.slice(0, 60000)}`,
      },
    ],
    true,
  );

  const parsed = parseJson<Partial<StudyMaterial>>(raw);
  if (!parsed || typeof parsed.summary !== "string" || !parsed.summary.trim()) {
    return { material: DEMO_MATERIAL, demo: true };
  }

  const material: StudyMaterial = {
    summary: parsed.summary.trim(),
    keyPoints: asStringArray(parsed.keyPoints),
    concepts: Array.isArray(parsed.concepts)
      ? parsed.concepts.filter((c) => c && typeof c.name === "string")
      : [],
    examples: asStringArray(parsed.examples),
    importantNotes: asStringArray(parsed.importantNotes),
    questions: Array.isArray(parsed.questions)
      ? parsed.questions.filter((q) => q && typeof q.question === "string")
      : [],
    revisionNotes: asStringArray(parsed.revisionNotes),
    resources: Array.isArray(parsed.resources)
      ? parsed.resources.filter((r) => r && typeof r.title === "string")
      : [],
  };

  return { material, demo: false };
}

export async function answerFromLecture(
  transcript: string,
  title: string,
  question: string,
): Promise<string> {
  const raw = await chat(
    [
      {
        role: "system",
        content:
          "You answer questions about one specific class, grounded only in the transcript provided. If the class did not cover something, say so plainly and do not guess. Keep answers short, clear and student-friendly.",
      },
      {
        role: "user",
        content: `Class: ${title}\n\nTranscript:\n${transcript.slice(0, 60000)}\n\nQuestion: ${question}`,
      },
    ],
    false,
  );

  if (raw?.trim()) return raw.trim();

  const needle = question.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
  const hit = transcript
    .split("\n\n")
    .find((para) => needle.some((w) => para.toLowerCase().includes(w)));

  return hit
    ? `The AI assistant is unavailable right now, but this part of the class looks relevant:\n\n${hit.trim()}`
    : "The AI assistant is unavailable right now, so I can't answer from this class yet. Try again in a moment.";
}
