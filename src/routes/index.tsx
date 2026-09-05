import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { WaveBackground } from "@/components/landing/WaveBackground";
import { Waveform } from "@/components/landing/Waveform";
import { Wordmark } from "@/components/brand/Wordmark";
import { GlassButton } from "@/components/ui/glass-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Classear.AI — Your class, heard and understood" },
      {
        name: "description",
        content:
          "Record your class and get a clear summary, key points, concepts, exam questions and revision notes — plus a chat grounded in that exact lecture.",
      },
      { property: "og:title", content: "Classear.AI — Your class, heard and understood" },
      {
        property: "og:description",
        content:
          "Record your class and get summaries, key points, concepts and exam questions in minutes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const NAV = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "AI notes", href: "#notes" },
  { label: "FAQ", href: "#faq" },
];

const STEPS = [
  {
    n: "01",
    kicker: "Listens",
    title: "Listens for 50 minutes",
    body: "One tap capture, live waveform, pause any time.",
  },
  {
    n: "02",
    kicker: "Understands",
    title: "Understands the lecture",
    body: "Concepts explained the way your teacher explained them.",
  },
  {
    n: "03",
    kicker: "Prepares",
    title: "Prepares you for the exam",
    body: "Short, conceptual and MCQ questions with answers.",
  },
];

const HOW = [
  ["01", "Listen", "Give microphone permission and start your class."],
  ["02", "Understand", "Classear turns the lecture into structured learning material."],
  ["03", "Revise", "Get summaries, key points, questions and resources."],
];

function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const mql = window.matchMedia("(min-width: 768px)");
    const onDesktop = () => {
      if (mql.matches) setMenuOpen(false);
    };
    onDesktop();
    mql.addEventListener("change", onDesktop);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      mql.removeEventListener("change", onDesktop);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="grain min-h-svh bg-background">
      <header className="sticky top-0 z-50 border-b border-border-soft bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[88px] max-w-6xl items-center justify-between gap-4 px-5 pt-[env(safe-area-inset-top)] sm:h-28 sm:px-9">
          <Link to="/" aria-label="Classear.AI home" className="reveal-1">
            <Wordmark className="text-[17px]" />
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV.map((item, i) => (
              <a
                key={item.href}
                href={item.href}
                style={{ animationDelay: `${120 + i * 70}ms` }}
                className="reveal-1 rounded-md px-3.5 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="reveal-1 hidden md:block" style={{ animationDelay: "420ms" }}>
            <GlassButton asChild variant="secondary" size="sm">
              <Link to="/app">Open App</Link>
            </GlassButton>
          </div>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
            className="glass flex h-12 w-12 shrink-0 flex-col items-center justify-center gap-[5px] rounded-lg md:hidden"
          >
            <span
              className={cn(
                "h-[1.5px] w-[18px] rounded-full bg-foreground transition-transform duration-300",
                menuOpen && "translate-y-[6.5px] rotate-45",
              )}
            />
            <span
              className={cn(
                "h-[1.5px] w-[18px] rounded-full bg-foreground transition-opacity duration-200",
                menuOpen && "opacity-0",
              )}
            />
            <span
              className={cn(
                "h-[1.5px] w-[18px] rounded-full bg-foreground transition-transform duration-300",
                menuOpen && "-translate-y-[6.5px] -rotate-45",
              )}
            />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col justify-center gap-8 px-9 md:hidden"
          style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(24px)" }}
        >
          <nav className="flex flex-col gap-8" aria-label="Mobile">
            {NAV.map((item, i) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                style={{ animationDelay: `${60 + i * 70}ms` }}
                className="reveal-1 text-[30px] font-medium leading-none tracking-[-0.03em] text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <GlassButton asChild block className="reveal-1 mt-6" style={{ animationDelay: "400ms" }}>
            <Link to="/app" onClick={() => setMenuOpen(false)}>
              Open App
            </Link>
          </GlassButton>
        </div>
      )}

      <main>
        <section className="relative flex min-h-[calc(100svh-88px)] flex-col justify-center overflow-hidden px-5 pb-24 pt-16 sm:px-9 lg:min-h-[calc(100svh-7rem)] lg:pb-32">
          <WaveBackground />
          <div className="relative mx-auto w-full max-w-3xl text-center">
            <span
              className="reveal-1 inline-flex items-center gap-2 rounded-[6px] border border-border px-3 py-1.5 text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground"
              style={{
                animationDelay: "160ms",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.015))",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
              }}
            >
              AI class listener
            </span>
            <h1
              className="reveal-1 mx-auto mt-8 max-w-[16ch] text-[clamp(2.75rem,12vw,5rem)] font-semibold leading-[1.0] tracking-[-0.035em] text-foreground sm:leading-[0.98]"
              style={{ animationDelay: "260ms" }}
            >
              Your class,{" "}
              <span className="serif-em text-soft/85">heard</span> and{" "}
              <span className="serif-em text-soft/85">understood</span>
            </h1>
            <p
              className="reveal-1 mx-auto mt-7 max-w-[350px] text-[14px] leading-[1.6] text-muted-foreground sm:max-w-[600px] sm:text-[15px]"
              style={{ animationDelay: "360ms" }}
            >
              Listen to your lectures and turn them into clear notes, key concepts, questions, and
              learning resources.
            </p>
            <div
              className="reveal-1 mx-auto mt-10 flex w-full max-w-[340px] flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:justify-center"
              style={{ animationDelay: "460ms" }}
            >
              <GlassButton asChild className="h-12 px-7">
                <Link to="/app">Open App</Link>
              </GlassButton>
              <GlassButton asChild variant="secondary" className="h-12 px-7">
                <a href="#how">See How It Works</a>
              </GlassButton>
            </div>
            <div
              className="reveal-1 mx-auto mt-12 w-full max-w-[520px]"
              style={{ animationDelay: "560ms" }}
            >
              <Waveform bars={64} className="h-10 opacity-90" />
              <p className="mt-4 text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground">
                Ready to listen
              </p>
            </div>
          </div>
        </section>


        <section id="features" className="border-t border-border-soft px-5 py-16 sm:px-9 sm:py-24">
          <div className="mx-auto max-w-4xl">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className={cn(
                  "grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 py-9 sm:grid-cols-[7rem_minmax(0,1fr)_minmax(0,1fr)] sm:items-baseline sm:gap-x-10",
                  i > 0 && "border-t border-border-soft",
                )}
              >
                <span className="text-[26px] font-medium leading-none tracking-[-0.03em] text-muted-foreground/50 sm:text-[34px]">
                  {s.n}
                </span>
                <div className="min-w-0">
                  <p className="text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground">
                    {s.kicker}
                  </p>
                  <h3 className="mt-2 text-[18px] font-medium text-foreground sm:text-[20px]">
                    {s.title}
                  </h3>
                </div>
                <p className="col-start-2 text-[13.5px] leading-[1.6] text-muted-foreground sm:col-start-3">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="border-t border-border-soft px-5 py-20 sm:px-9 sm:py-28">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-[clamp(1.9rem,6vw,3rem)] font-semibold tracking-[-0.035em] text-foreground">
              How it works
            </h2>
            <div className="mt-12 space-y-px">
              {HOW.map(([n, title, body], i) => (
                <div
                  key={n}
                  className={cn(
                    "grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 py-8 sm:gap-x-10",
                    i > 0 && "border-t border-border-soft",
                  )}
                >
                  <span className="text-[13px] tracking-[0.2em] text-muted-foreground/60">{n}</span>
                  <div className="min-w-0">
                    <h3 className="text-[17px] font-medium text-foreground sm:text-[19px]">
                      {title}
                    </h3>
                    <p className="mt-2 max-w-[46ch] text-[13.5px] leading-[1.6] text-muted-foreground">
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="notes" className="border-t border-border-soft px-5 py-20 sm:px-9 sm:py-28">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-[clamp(1.9rem,6vw,3rem)] font-semibold tracking-[-0.035em] text-foreground">
              What you get back
            </h2>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["TL;DR", "The whole class in a paragraph you can read before the exam."],
                ["Key points & concepts", "Definitions, plus your teacher's own explanation."],
                ["Exam questions", "Short answers, conceptual prompts and MCQs."],
                ["Ask this class", "Chat grounded only in what was actually said."],
              ].map(([title, body]) => (
                <div key={title} className="surface rounded-xl p-6">
                  <h3 className="text-[14px] font-medium text-foreground">{title}</h3>
                  <p className="mt-2 text-[13px] leading-[1.6] text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="border-t border-border-soft px-5 py-20 sm:px-9 sm:py-28">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-[clamp(1.9rem,6vw,3rem)] font-semibold tracking-[-0.035em] text-foreground">
              FAQ
            </h2>
            <Accordion type="single" collapsible className="mt-10">
              {[
                [
                  "Is my audio stored?",
                  "No. Audio is used to produce the transcript and is discarded straight after processing. Only the transcript and notes are kept, and you can delete those any time.",
                ],
                [
                  "How long can one class be?",
                  "Up to 50 minutes per recording. Longer lectures can be captured as two classes.",
                ],
                [
                  "Does it record without me knowing?",
                  "Never. The microphone is only requested when you tap start, and the screen shows a clear listening state throughout.",
                ],
                [
                  "What if the AI is unavailable?",
                  "You still get a full walkthrough with a clearly labelled demo class, so nothing is a dead end.",
                ],
              ].map(([q, a], i) => (
                <AccordionItem key={q} value={`item-${i}`}>
                  <AccordionTrigger className="text-left text-[15px]">{q}</AccordionTrigger>
                  <AccordionContent className="text-[13px] leading-[1.6] text-muted-foreground">
                    {a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      <footer className="border-t border-border-soft px-5 py-12 sm:px-9">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <Wordmark />
          <p className="text-[12px] text-muted-foreground">
            Your class, heard and understood. © {new Date().getFullYear()} Classear.AI
          </p>
        </div>
      </footer>
    </div>
  );
}
