import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/app/new-class")({
  beforeLoad: () => {
    throw redirect({ to: "/classes/new" });
  },
});
