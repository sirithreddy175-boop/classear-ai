import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, SectionCard } from "@/components/app/AppShell";
import { GlassButton } from "@/components/ui/glass-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Classear.AI" },
      {
        name: "description",
        content: "Manage your Classear.AI account, privacy and sign-out.",
      },
      { property: "og:title", content: "Settings — Classear.AI" },
      { property: "og:description", content: "Your account and privacy settings." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const user = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await supabase.auth.getUser()).data.user,
  });

  return (
    <AppShell className="max-w-2xl">
      <h1 className="text-[clamp(1.6rem,4vw,2.2rem)] font-semibold text-foreground">Settings</h1>

      <div className="mt-8 space-y-6">
        <SectionCard title="Account">
          <p className="text-[14px] text-foreground">{user.data?.email ?? "—"}</p>
          <p className="mt-2 text-[13px] text-muted-foreground">
            You're signed in. Your classes are private to this account.
          </p>
        </SectionCard>

        <SectionCard title="Change password">
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              if (savingPassword) return;
              setSavingPassword(true);
              try {
                const { error } = await supabase.auth.updateUser({
                  password: newPassword,
                  ...({ current_password: currentPassword } as Record<string, string>),
                });
                if (error) throw error;
                toast.success("Password updated.");
                setCurrentPassword("");
                setNewPassword("");
              } catch (error) {
                toast.error(
                  error instanceof Error ? error.message : "Could not update your password.",
                );
              } finally {
                setSavingPassword(false);
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
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
            <GlassButton type="submit" disabled={savingPassword}>
              {savingPassword ? "Saving…" : "Update password"}
            </GlassButton>
          </form>
        </SectionCard>

        <SectionCard title="Privacy">
          <p className="text-[14px] leading-relaxed text-muted-foreground">
            Class audio is never stored. It is sent for transcription and discarded immediately
            afterwards — only the transcript and notes are saved, and you can delete any class at any
            time.
          </p>
        </SectionCard>

        <SectionCard title="Session">
          <GlassButton
            variant="secondary"
            onClick={async () => {
              const { error } = await supabase.auth.signOut();
              if (error) {
                toast.error(error.message);
                return;
              }
              navigate({ to: "/" });
            }}
          >
            Sign out
          </GlassButton>
        </SectionCard>
      </div>
    </AppShell>
  );
}
