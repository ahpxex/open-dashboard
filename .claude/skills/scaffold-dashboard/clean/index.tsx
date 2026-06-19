import { createFileRoute } from "@tanstack/react-router";

import { appConfig } from "@/config/app";

export const Route = createFileRoute("/_app/")({
  component: DashboardHome,
});

function DashboardHome() {
  const { user } = Route.useRouteContext();

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Welcome to {appConfig.name}
      </h1>
      <p className="max-w-prose text-sm text-muted-foreground">
        Signed in as {user.name}. This is your clean shell — add a resource with{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
          bun run create-resource &lt;name&gt;
        </code>
        , or compose screens from the gallery skills.
      </p>
    </div>
  );
}
