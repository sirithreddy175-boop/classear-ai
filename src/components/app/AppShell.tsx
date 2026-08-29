import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Wordmark } from "@/components/brand/Wordmark";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="grain min-h-svh bg-background">
      <header className="sticky top-0 z-40 border-b border-border-soft bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-5">
          <Link to="/dashboard" aria-label="Dashboard">
            <Wordmark />
          </Link>
          <nav className="flex items-center gap-1" aria-label="App">
            <ShellLink to="/dashboard">Home</ShellLink>
            <ShellLink to="/classes">Classes</ShellLink>
            <ShellLink to="/settings">Settings</ShellLink>
          </nav>
        </div>
      </header>
      <main
        className={cn(
          "mx-auto w-full max-w-5xl px-5 pb-[max(3rem,env(safe-area-inset-bottom))] pt-10",
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}

function ShellLink({ to, children }: { to: "/dashboard" | "/classes" | "/settings"; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-md px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      activeProps={{ className: "text-foreground" }}
    >
      {children}
    </Link>
  );
}

export function SectionCard({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="surface rounded-xl p-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-[13px] uppercase tracking-[0.16em] text-muted-foreground">{title}</h2>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
