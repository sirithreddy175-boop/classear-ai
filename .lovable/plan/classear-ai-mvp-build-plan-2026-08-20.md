# Classear.AI — MVP Build Plan

**Your class, heard and understood.**

An AI class listener for students: record a lecture, get transcript, summary, key points, concepts, exam questions, revision notes, resources, and a lecture-grounded "Ask This Class" chat.

## Visual identity
Pure black canvas (#000), white/silver text hierarchy, hairline borders, subtle grain on large surfaces, restrained silver glow. Inter for everything; Instrument Serif Italic only for hero emphasis words. Glassy silver "liquid metal" primary buttons with diagonal shine on hover and real `:active` feedback for touch. Motion uses `cubic-bezier(0.16, 1, 0.3, 1)` and fully respects `prefers-reduced-motion`.

## Screens
1. `/` — Landing: three-column header (wordmark + mic mark, centered nav, Open App), bottom-centered hero with badge, headline, dual CTAs, and a live monochrome waveform (idle "Ready to listen" / "● Listening to your class"). Three minimal capability lines, How It Works (01 Listen / 02 Understand / 03 Learn), AI Notes, FAQ, minimal footer. No fake stats, no stock photos.
2. `/auth` — Dark sign up / login / password reset.
3. `/dashboard` — "Ready for your next class?", large Start New Class CTA, recent classes list (subject, title, date, duration, status).
4. `/classes/new` — Title, subject, teacher (optional) → Start Listening.
5. `/classes/$id/record` — Full-screen recording: title/subject, large listening visualization, `● Listening`, timer, live waveform, Finish Class + Pause, leave-confirmation guard.
6. `/classes/$id` — Results: TL;DR, Key Points, Concepts, Examples, Important Notes, Exam Questions (short/conceptual/MCQ), Revision Notes, Resources (labelled as suggested topics, never invented URLs), collapsible searchable transcript with copy/export, and Ask This Class chat.
7. `/classes` — History with open / rename / delete (confirm).
8. `/settings` — Profile, account, privacy, audio/data preferences, delete class data, logout.

## Recording & privacy
Browser `MediaRecorder` + Web Audio analyser for the waveform. Permission is requested only on explicit user action, with a clear explainer and a graceful denied state. 30-minute cap, chunked capture. Audio is deleted after processing by default; transcript and notes are kept. No hidden recording.

## AI architecture
A single `aiService` abstraction — `transcribeLecture`, `analyzeLecture`, `generateQuestions`, `generateResources`, `answerFromLecture` — all called from server functions so no key ever reaches the browser. Provider-independent and free-tier-first. If no provider is configured the app runs **Demo Mode** with a realistic "Introduction to Machine Learning" sample class (transcript, summary, key points, concepts, examples, questions, revision notes, resources), clearly labelled *Demo Class*, so the whole journey works with zero configuration.

## Data (Lovable Cloud / Supabase)
```text
profiles        id, user_id, display_name, avatar_url, created_at
classes         id, user_id, title, subject, teacher, started_at, ended_at,
                duration, status, audio_url, transcript, summary,
                created_at, updated_at
learning_material  id, class_id, user_id, key_points, concepts, examples,
                   questions, revision_notes, resources
conversations   id, class_id, user_id, role, content, created_at
```
RLS on every table scoped to `auth.uid()`, with explicit grants. Ownership is verified server-side, never taken from the client.

## Quality bar
Mobile-first, no horizontal overflow, safe-area aware, ~44px touch targets, fullscreen mobile menu. Every async action has a loading state and blocks duplicate submits. Human-friendly errors with retry for mic denied/unavailable, upload, AI unavailable, rate limit, network, auth, and processing failures. Semantic HTML, ARIA, keyboard focus rings, screen-reader recording status. No Three.js/WebGL/Lottie/background video — CSS and SVG only.

## Build order (credit-conscious)
1. Design system, layout shell, landing page + waveform.
2. Enable Lovable Cloud, auth screens, protected routes, schema + RLS.
3. Dashboard, create class, recording screen, processing states.
4. `aiService` + Demo Mode, results page, Ask This Class.
5. Classes history, settings, responsive/accessibility pass, end-to-end verification.

## Notes
- Reusable components and clean folders throughout; nothing crammed into one file.
- The Originkit CLI/hero is not used — the hero is hand-built for this stack, and that pasted API key should be rotated.
