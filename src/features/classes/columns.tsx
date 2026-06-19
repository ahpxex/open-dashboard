import type { ColumnDef } from "@tanstack/react-table";
import { ActionMenu, type ChipColor, StatusChip } from "@/infra/ui";
import type { ClassGroup, ClassLevel } from "./schema";

export const levelColorMap: Record<ClassLevel, ChipColor> = {
  beginner: "success",
  intermediate: "warning",
  advanced: "danger",
};

export interface ClassesTableContext {
  onEdit: (group: ClassGroup) => void;
  onDelete: (group: ClassGroup) => void;
}

export function createClassesColumns(
  context: ClassesTableContext,
): ColumnDef<ClassGroup>[] {
  return [
    {
      accessorKey: "name",
      header: "Class",
      cell: (info) => (
        <span className="font-medium">{info.getValue() as string}</span>
      ),
    },
    {
      accessorKey: "teacher",
      header: "Teacher",
      enableSorting: false,
      cell: (info) => (
        <span className="text-muted-foreground">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "studentCount",
      header: "Students",
      cell: (info) => (
        <span className="tabular-nums">{info.getValue() as number}</span>
      ),
    },
    {
      accessorKey: "level",
      header: "Level",
      enableSorting: false,
      cell: (info) => (
        <StatusChip
          status={info.getValue() as ClassLevel}
          colorMap={levelColorMap}
        />
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: (info) => {
        const group = info.row.original;
        return (
          <div className="flex justify-end">
            <ActionMenu
              onEdit={() => context.onEdit(group)}
              onDelete={() => context.onDelete(group)}
            />
          </div>
        );
      },
    },
  ];
}
