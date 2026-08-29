import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { AppShell, SectionCard } from "@/components/app/AppShell";
import { GlassButton } from "@/components/ui/glass-button";
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
