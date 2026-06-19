import { CaretRightIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { employeesListQuery } from "@/features/employees/queries";
import {
  allEmployeesParams,
  type Employee,
  type EmployeeStatus,
} from "@/features/employees/schema";
import { type ChipColor, StatusChip } from "@/infra/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/hr/org")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(employeesListQuery(allEmployeesParams)),
  component: OrgChart,
});

const statusColorMap: Record<EmployeeStatus, ChipColor> = {
  active: "success",
  onleave: "warning",
  contractor: "secondary",
};

const statusLabelMap: Record<EmployeeStatus, string> = {
  active: "Active",
  onleave: "On leave",
  contractor: "Contractor",
};

function OrgChart() {
  const query = useQuery(employeesListQuery(allEmployeesParams));
  const employees = query.data?.rows ?? [];

  const { roots, childrenOf } = useMemo(() => {
    const ids = new Set(employees.map((employee) => employee.id));
    const byManager = new Map<string, Employee[]>();
    for (const employee of employees) {
      const key =
        employee.managerId && ids.has(employee.managerId)
          ? employee.managerId
          : "";
      const list = byManager.get(key) ?? [];
      list.push(employee);
      byManager.set(key, list);
    }
    return {
      roots: byManager.get("") ?? [],
      childrenOf: (id: string) => byManager.get(id) ?? [],
    };
  }, [employees]);

  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(roots.map((employee) => employee.id)),
  );

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Org chart
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          The reporting hierarchy, built from each person's manager. Expand a
          manager to see their reports.
        </p>
      </div>

      <div className="max-w-2xl border border-border bg-card p-2">
        <ul className="flex flex-col">
          {roots.map((employee) => (
            <OrgNode
              key={employee.id}
              employee={employee}
              depth={0}
              expanded={expanded}
              onToggle={toggle}
              childrenOf={childrenOf}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

function OrgNode({
  employee,
  depth,
  expanded,
  onToggle,
  childrenOf,
}: {
  employee: Employee;
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  childrenOf: (id: string) => Employee[];
}) {
  const reports = childrenOf(employee.id);
  const hasReports = reports.length > 0;
  const isOpen = expanded.has(employee.id);

  return (
    <li>
      <div
        className="flex items-center gap-2 px-1.5 py-1.5"
        style={{ paddingLeft: `${depth * 20 + 6}px` }}
      >
        <button
          type="button"
          onClick={() => hasReports && onToggle(employee.id)}
          className={cn(
            "grid size-4 shrink-0 place-items-center text-muted-foreground",
            !hasReports && "invisible",
          )}
          aria-label={isOpen ? "Collapse" : "Expand"}
        >
          <CaretRightIcon
            className={cn(
              "size-3.5 transition-transform",
              isOpen && "rotate-90",
            )}
          />
        </button>
        <span className="grid size-7 shrink-0 place-items-center bg-muted text-xs font-semibold text-foreground">
          {employee.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)}
        </span>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{employee.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {employee.title}
            </p>
          </div>
          <StatusChip
            status={employee.status}
            colorMap={statusColorMap}
            labelMap={statusLabelMap}
          />
        </div>
      </div>

      {hasReports && isOpen ? (
        <ul className="flex flex-col">
          {reports.map((report) => (
            <OrgNode
              key={report.id}
              employee={report}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              childrenOf={childrenOf}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
