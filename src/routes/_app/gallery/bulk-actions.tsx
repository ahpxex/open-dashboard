import {
  CheckCircleIcon,
  PauseCircleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/infra/table";
import { type ChipColor, StatusChip } from "@/infra/ui";
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/_app/gallery/bulk-actions")({
  component: BulkActionsDemo,
});

type Member = {
  id: string;
  name: string;
  email: string;
  status: "active" | "paused";
};

const STATUS_COLOR: Record<Member["status"], ChipColor> = {
  active: "success",
  paused: "secondary",
};

const SEED: Member[] = [
  {
    id: "u-1",
    name: "Ada Lovelace",
    email: "ada@example.com",
    status: "active",
  },
  {
    id: "u-2",
    name: "Alan Turing",
    email: "alan@example.com",
    status: "active",
  },
  {
    id: "u-3",
    name: "Grace Hopper",
    email: "grace@example.com",
    status: "paused",
  },
  {
    id: "u-4",
    name: "Katherine Johnson",
    email: "katherine@example.com",
    status: "active",
  },
  {
    id: "u-5",
    name: "Linus Torvalds",
    email: "linus@example.com",
    status: "active",
  },
  {
    id: "u-6",
    name: "Margaret Hamilton",
    email: "margaret@example.com",
    status: "paused",
  },
  {
    id: "u-7",
    name: "Dennis Ritchie",
    email: "dennis@example.com",
    status: "active",
  },
  {
    id: "u-8",
    name: "Barbara Liskov",
    email: "barbara@example.com",
    status: "active",
  },
  {
    id: "u-9",
    name: "Donald Knuth",
    email: "donald@example.com",
    status: "paused",
  },
  {
    id: "u-10",
    name: "Radia Perlman",
    email: "radia@example.com",
    status: "active",
  },
  {
    id: "u-11",
    name: "Ken Thompson",
    email: "ken@example.com",
    status: "active",
  },
  {
    id: "u-12",
    name: "Frances Allen",
    email: "frances@example.com",
    status: "active",
  },
];

function BulkActionsDemo() {
  const [rows, setRows] = useState<Member[]>(SEED);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const confirm = useConfirm();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term),
    );
  }, [rows, search]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns = useMemo<ColumnDef<Member>[]>(
    () => [
      { accessorKey: "name", header: "Name", enableSorting: false },
      {
        accessorKey: "email",
        header: "Email",
        enableSorting: false,
        cell: (info) => (
          <span className="text-muted-foreground">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: false,
        cell: (info) => (
          <StatusChip
            status={info.getValue() as Member["status"]}
            colorMap={STATUS_COLOR}
          />
        ),
      },
    ],
    [],
  );

  function setStatus(ids: string[], status: Member["status"]) {
    const set = new Set(ids);
    setRows((prev) => prev.map((r) => (set.has(r.id) ? { ...r, status } : r)));
    setRowSelection({});
    toast.success(`${ids.length} member(s) marked ${status}`);
  }

  async function removeMany(ids: string[]) {
    const ok = await confirm({
      title: `Delete ${ids.length} member(s)?`,
      description: "This action cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    const set = new Set(ids);
    setRows((prev) => prev.filter((r) => !set.has(r.id)));
    setRowSelection({});
    toast.success(`${ids.length} member(s) deleted`);
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="shrink-0">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Bulk actions
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Select rows with the checkboxes; a contextual action bar appears with
          operations that apply to the whole selection. Built on{" "}
          <code className="text-foreground">DataTable</code>'s opt-in row
          selection (<code className="text-foreground">selectionActions</code>),
          here over local state with destructive actions routed through{" "}
          <code className="text-foreground">useConfirm()</code>.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={paged}
        total={filtered.length}
        getRowId={(row) => row.id}
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search members…"
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        emptyMessage="No members found."
        selectionActions={(ids) => (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatus(ids, "active")}
            >
              <CheckCircleIcon size={16} />
              Activate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatus(ids, "paused")}
            >
              <PauseCircleIcon size={16} />
              Pause
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeMany(ids)}
            >
              <TrashIcon size={16} />
              Delete
            </Button>
          </>
        )}
      />
    </div>
  );
}
