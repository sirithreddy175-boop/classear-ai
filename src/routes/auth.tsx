import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Wordmark } from "@/components/brand/Wordmark";
import { GlassButton } from "@/components/ui/glass-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Classear.AI" },
      {
        name: "description",
        content: "Sign in to Classear.AI to record classes and revise from your own lectures.",
      },
      { property: "og:title", content: "Sign in — Classear.AI" },
      { property: "og:description", content: "Access your recorded classes and study notes." },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "signup" | "reset";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your inbox if confirmation is required.");
        const { data } = await supabase.auth.getSession();
        if (data.session) navigate({ to: "/dashboard" });
        else setMode("login");
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        toast.success("Password reset link sent.");
        setMode("login");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grain flex min-h-svh flex-col items-center justify-center bg-background px-5 py-14">
      <Link to="/" className="mb-10">
        <Wordmark />
      </Link>
      <div className="surface w-full max-w-sm rounded-xl p-7">
        <h1 className="text-xl font-semibold text-foreground">
          {mode === "login" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset password"}
        </h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          {mode === "reset"
            ? "We'll email you a link to set a new password."
            : "Your classes stay private to your account."}
        </p>

        <form className="mt-7 space-y-4" onSubmit={submit}>
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder="Your name"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@school.edu"
            />
          </div>
          {mode !== "reset" && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                placeholder="At least 6 characters"
              />
            </div>
          )}
          <GlassButton type="submit" block disabled={busy}>
            {busy
              ? "Please wait…"
              : mode === "login"
                ? "Sign in"
                : mode === "signup"
                  ? "Create account"
                  : "Send reset link"}
          </GlassButton>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-[13px] text-muted-foreground">
          {mode !== "login" ? (
            <button type="button" className="text-left hover:text-foreground" onClick={() => setMode("login")}>
              Already have an account? Sign in
            </button>
          ) : (
            <>
              <button type="button" className="text-left hover:text-foreground" onClick={() => setMode("signup")}>
                New here? Create an account
              </button>
              <button type="button" className="text-left hover:text-foreground" onClick={() => setMode("reset")}>
                Forgot your password?
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
