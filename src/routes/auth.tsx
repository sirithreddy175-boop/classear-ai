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
type ResetStep = "email" | "code" | "password";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<ResetStep>("email");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

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
      } else if (step === "email") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: false },
        });
        if (error) throw error;
        toast.success("We sent a 6-digit code to your email.");
        setStep("code");
      } else if (step === "code") {
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: code.trim(),
          type: "email",
        });
        if (error) throw error;
        toast.success("Code verified. Set a new password.");
        setStep("password");
      } else {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        toast.success("Password updated. You're signed in.");
        navigate({ to: "/dashboard" });
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
          {mode === "login"
            ? "Welcome back"
            : mode === "signup"
              ? "Create your account"
              : step === "email"
                ? "Forgot your password?"
                : step === "code"
                  ? "Enter your code"
                  : "Set a new password"}
        </h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          {mode === "reset"
            ? step === "email"
              ? "We'll email you a 6-digit code — no links to click."
              : step === "code"
                ? `Type the 6-digit code we sent to ${email}.`
                : "Choose a new password for your account."
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
          {!(mode === "reset" && step !== "email") && (
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
          )}
          {mode === "reset" && step === "code" && (
            <div className="space-y-2">
              <Label htmlFor="code">6-digit code</Label>
              <Input
                id="code"
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={8}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
              />
            </div>
          )}
          {mode === "reset" && step === "password" && (
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>
          )}
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
                  : step === "email"
                    ? "Send code"
                    : step === "code"
                      ? "Verify code"
                      : "Save new password"}
          </GlassButton>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-[13px] text-muted-foreground">
          {mode === "reset" && step === "code" ? (
            <button
              type="button"
              className="text-left hover:text-foreground"
              onClick={() => setStep("email")}
            >
              Didn't get it? Send another code
            </button>
          ) : null}
          {mode !== "login" ? (
            <button
              type="button"
              className="text-left hover:text-foreground"
              onClick={() => {
                setMode("login");
                setStep("email");
                setCode("");
              }}
            >
              Already have an account? Sign in
            </button>
          ) : (
            <>
              <button type="button" className="text-left hover:text-foreground" onClick={() => setMode("signup")}>
                New here? Create an account
              </button>
              <button
                type="button"
                className="text-left hover:text-foreground"
                onClick={() => {
                  setMode("reset");
                  setStep("email");
                }}
              >
                Forgot your password? Get a code by email
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
