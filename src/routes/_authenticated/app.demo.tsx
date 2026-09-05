import { createFileRoute, redirect } from "@tanstack/react-router";

import { ensureDemoClass } from "@/lib/classes-data";

export const Route = createFileRoute("/_authenticated/app/demo")({
  loader: async () => {
    const id = await ensureDemoClass();
    throw redirect({ to: "/classes/$id", params: { id } });
  },
  component: () => null,
});
