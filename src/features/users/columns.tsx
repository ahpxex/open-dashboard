import type { ColumnDef } from "@tanstack/react-table";
import { ActionMenu, type ChipColor, StatusChip } from "@/infra/ui";
import type { User, UserRole, UserStatus } from "./schema";

export const roleColorMap: Record<UserRole, ChipColor> = {
  admin: "primary",
  member: "default",
  viewer: "secondary",
};

export const roleLabelMap: Record<UserRole, string> = {
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

export const userStatusColorMap: Record<UserStatus, ChipColor> = {
  active: "success",
  invited: "warning",
  suspended: "danger",
};

export const userStatusLabelMap: Record<UserStatus, string> = {
  active: "Active",
  invited: "Invited",
  suspended: "Suspended",
};

export interface UsersTableContext {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

function formatDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function createUsersColumns(
  context: UsersTableContext,
): ColumnDef<User>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: (info) => (
        <span className="font-medium">{info.getValue() as string}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: (info) => (
        <span className="font-mono text-xs text-muted-foreground">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      enableSorting: false,
      cell: (info) => (
        <StatusChip
          status={info.getValue() as UserRole}
          colorMap={roleColorMap}
          labelMap={roleLabelMap}
        />
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: false,
      cell: (info) => (
        <StatusChip
          status={info.getValue() as UserStatus}
          colorMap={userStatusColorMap}
          labelMap={userStatusLabelMap}
        />
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: (info) => (
        <span className="text-muted-foreground tabular-nums">
          {formatDate(info.getValue() as string | Date)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: (info) => {
        const user = info.row.original;
        return (
          <div className="flex justify-end">
            <ActionMenu
              onEdit={() => context.onEdit(user)}
              onDelete={() => context.onDelete(user)}
            />
          </div>
        );
      },
    },
  ];
}
