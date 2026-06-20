import {
  GearSixIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RoleGate } from "@/components/RoleGate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { can, ROLE_LABELS, ROLES, type Role } from "@/lib/rbac";
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/_app/gallery/rbac")({
  component: RbacDemo,
});

interface Doc {
  id: number;
  title: string;
  owner: string;
  status: "draft" | "published";
}

const DOCS: Doc[] = [
  {
    id: 1,
    title: "Q3 launch plan",
    owner: "Ada Lovelace",
    status: "published",
  },
  {
    id: 2,
    title: "Pricing experiment",
    owner: "Grace Hopper",
    status: "draft",
  },
  {
    id: 3,
    title: "Onboarding checklist",
    owner: "Alan Turing",
    status: "published",
  },
];

/**
 * Roles & permissions — flip the active role and watch the toolbar, row actions,
 * and the settings panel react. Create/Edit/Delete are disabled when the role
 * lacks the matching `resource:*` permission; the settings card is removed
 * entirely by `<RoleGate>` when the role can't `settings:manage`.
 *
 * All gating goes through `@/lib/rbac` (`can` + the permission matrix) — the same
 * helpers a real app uses to gate UI, with `requireRole` guarding the server.
 */
function RbacDemo() {
  const [role, setRole] = useState<Role>("editor");

  const canCreate = can(role, "resource:create");
  const canUpdate = can(role, "resource:update");
  const canDelete = can(role, "resource:delete");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Roles &amp; permissions
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Switch the active role to see authorization in action. Buttons and row
          actions enable/disable from <code>can(role, permission)</code>, and
          the settings panel is gated by <code>&lt;RoleGate&gt;</code>. On the
          server, mirror these checks with <code>requireRole</code> — UI gating
          is UX, not security.
        </p>
      </div>

      {/* Role switcher */}
      <Card>
        <CardHeader>
          <CardTitle>Acting as</CardTitle>
          <CardDescription>
            Pick a role to preview the experience that user would get.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          {ROLES.map((r) => (
            <Button
              key={r}
              type="button"
              size="sm"
              variant={r === role ? "default" : "outline"}
              onClick={() => setRole(r)}
            >
              {ROLE_LABELS[r]}
            </Button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">
            Permissions:{" "}
            <span className="font-mono text-foreground">
              {(
                [
                  "resource:read",
                  "resource:create",
                  "resource:update",
                  "resource:delete",
                  "settings:manage",
                ] as const
              )
                .filter((p) => can(role, p))
                .map((p) => p.replace("resource:", ""))
                .join(", ")}
            </span>
          </span>
        </CardContent>
      </Card>

      {/* Resource toolbar + table with per-action gating */}
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
          <div>
            <CardTitle>Documents</CardTitle>
            <CardDescription>
              A sample resource list with role-gated actions.
            </CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={!canCreate}
            onClick={() => toast.success("Created a document")}
          >
            <PlusIcon />
            New document
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Separator />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-px text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DOCS.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {doc.owner}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        doc.status === "published" ? "default" : "secondary"
                      }
                      className="capitalize"
                    >
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        disabled={!canUpdate}
                        aria-label="Edit"
                        onClick={() => toast.success(`Edited "${doc.title}"`)}
                      >
                        <PencilSimpleIcon />
                      </Button>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        disabled={!canDelete}
                        aria-label="Delete"
                        onClick={() => toast.success(`Deleted "${doc.title}"`)}
                      >
                        <TrashIcon />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Whole panel gated — only admins (settings:manage) see it */}
      <RoleGate
        role={role}
        can="settings:manage"
        fallback={
          <Card>
            <CardContent className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
              <GearSixIcon size={18} />
              Workspace settings are visible to admins only.
            </CardContent>
          </Card>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GearSixIcon size={18} />
              Workspace settings
            </CardTitle>
            <CardDescription>
              Gated by <code>&lt;RoleGate can="settings:manage"&gt;</code> —
              only admins can manage these.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <label className="flex items-center justify-between gap-4 text-sm">
              <span>Require two-factor authentication</span>
              <Switch defaultChecked />
            </label>
            <label className="flex items-center justify-between gap-4 text-sm">
              <span>Allow public document sharing</span>
              <Switch />
            </label>
          </CardContent>
        </Card>
      </RoleGate>
    </div>
  );
}
