import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { appConfig } from "@/config/app";
import { getSession } from "@/lib/auth-server";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async () => {
    const session = await getSession();
    if (session) {
      throw redirect({ to: "/" });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  const Logo = appConfig.logo;
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center justify-center gap-2.5">
          <div className="grid size-9 shrink-0 place-items-center bg-primary text-primary-foreground">
            <Logo size={20} weight="fill" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            {appConfig.name}
          </span>
        </div>
        <Outlet />
      </div>
    </main>
  );
}
