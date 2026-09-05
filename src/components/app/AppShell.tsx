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
        <div className="mx-auto grid h-16 max-w-5xl grid-cols-[auto_minmax(0,1fr)] items-center gap-3 px-5 pt-[env(safe-area-inset-top)] sm:flex sm:justify-between sm:gap-4">
          <Link to="/app" aria-label="Classear.AI app home" className="shrink-0">
            <Wordmark className="text-[14px] sm:text-[15px]" />
          </Link>
          <nav
            className="-mx-1 flex min-w-0 items-center justify-end gap-0.5 overflow-x-auto sm:gap-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="App"
          >
            <ShellLink to="/app">Home</ShellLink>
            <ShellLink to="/dashboard">Recent</ShellLink>
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

function ShellLink({ to, children }: { to: "/app" | "/dashboard" | "/classes" | "/settings"; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="shrink-0 whitespace-nowrap rounded-md px-2.5 py-2.5 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground sm:px-3 sm:text-[13px]"
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
