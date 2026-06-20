import { InfoIcon, MagicWandIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/_app/gallery/auth-methods")({
  component: AuthMethodsDemo,
});

/**
 * Sign-in methods — a visual catalogue of the auth methods you can layer on top
 * of email + password: social OAuth (`SocialButtons`) and a passwordless magic
 * link. This is UI only: the social buttons no-op gracefully until providers are
 * configured, and the magic-link form just toasts a mock "link sent". Wiring the
 * real backend is the `add-auth-method` skill.
 */
function AuthMethodsDemo() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function requestMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Enter an email first");
      return;
    }
    // Real wiring: authClient.signIn.magicLink({ email, callbackURL: "/" }).
    setSent(true);
    toast.success(`Magic link sent to ${email}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Sign-in methods
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          The auth methods you can add beside email + password — social OAuth
          and a passwordless magic link. Drop these onto the login page; enable
          the backends in <code>src/lib/auth.ts</code> (keeping{" "}
          <code>tanstackStartCookies</code> the last plugin).
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Social OAuth */}
        <Card>
          <CardHeader>
            <CardTitle>Social sign-in</CardTitle>
            <CardDescription>
              The drop-in <code>&lt;SocialButtons&gt;</code> component. Calls{" "}
              <code>authClient.signIn.social(&#123; provider &#125;)</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <SocialButtons />
            <p className="text-xs text-muted-foreground">
              Buttons toast a friendly message until you add provider keys.
            </p>
          </CardContent>
        </Card>

        {/* Magic link */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MagicWandIcon size={18} />
              Magic link
            </CardTitle>
            <CardDescription>
              Passwordless: email a one-time sign-in link instead of a password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="flex flex-col items-start gap-3">
                <p className="text-sm text-muted-foreground">
                  A sign-in link was &ldquo;sent&rdquo; to{" "}
                  <span className="font-medium text-foreground">{email}</span>.
                  (Mock — no email is actually delivered in this demo.)
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSent(false);
                    setEmail("");
                  }}
                >
                  Use a different email
                </Button>
              </div>
            ) : (
              <form onSubmit={requestMagicLink} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="magic-email">Email</Label>
                  <Input
                    id="magic-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Send magic link
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      <Alert>
        <InfoIcon />
        <AlertDescription>
          Real providers need keys: set the OAuth client id/secret env vars and
          enable <code>socialProviders</code> + the <code>magicLink()</code>{" "}
          plugin in <code>src/lib/auth.ts</code>. Until then these controls are
          a visual catalogue — see the <code>add-auth-method</code> skill.
        </AlertDescription>
      </Alert>
    </div>
  );
}
