export type Concept = {
  name: string;
  explanation: string;
  teacherExplanation?: string;
};

export type ExamQuestion = {
  type: "short" | "conceptual" | "mcq";
  question: string;
  options?: string[];
  answer: string;
};

export type SuggestedResource = {
  title: string;
  kind: string;
  why: string;
};

export type RoadmapStep = {
  title: string;
  timeframe: string;
  goal: string;
  tasks: string[];
  searchTerms: string[];
};

export type Roadmap = {
  topic: string;
  overview: string;
  totalTime: string;
  steps: RoadmapStep[];
  practice: string[];
};


export type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type Quiz = {
  topic: string;
  questions: QuizQuestion[];
};

export type StudyMaterial = {
  summary: string;
  keyPoints: string[];
  concepts: Concept[];
  examples: string[];
  importantNotes: string[];
  questions: ExamQuestion[];
  revisionNotes: string[];
  resources: SuggestedResource[];
};

export type ClassRecord = {
  id: string;
  title: string;
  subject: string | null;
  teacher: string | null;
  started_at: string | null;
  ended_at: string | null;
  duration: number;
  status: string;
  transcript: string | null;
  summary: string | null;
  is_demo: boolean;
  created_at: string;
};

export type ClassDetail = ClassRecord & {
  material: StudyMaterial | null;
};

export const CLASS_STATUS_LABEL: Record<string, string> = {
  draft: "Not recorded",
  recording: "Recording",
  processing: "Processing",
  ready: "Ready",
  failed: "Needs retry",
};

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}
