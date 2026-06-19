import { PlusIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  redemptionCodesListQuery,
  useDeleteRedemptionCode,
  useUpdateRedemptionCode,
} from "@/features/redemption-codes/queries";
import { RedemptionCodeFormDialog } from "@/features/redemption-codes/RedemptionCodeFormDialog";
import {
  allCodesParams,
  type RedemptionCode,
  type RedemptionCodeStatus,
  redemptionCodeStatuses,
} from "@/features/redemption-codes/schema";
import { ActionMenu, type ChipColor, StatusChip } from "@/infra/ui";

export const Route = createFileRoute("/_app/taoracle/affiliate")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      redemptionCodesListQuery(allCodesParams),
    ),
  component: AffiliatePage,
});

const statusColorMap: Record<RedemptionCodeStatus, ChipColor> = {
  active: "success",
  paused: "warning",
  expired: "default",
};

type DialogState = { mode: "create" | "edit"; code?: RedemptionCode } | null;

function AffiliatePage() {
  const query = useQuery(redemptionCodesListQuery(allCodesParams));
  const update = useUpdateRedemptionCode();
  const remove = useDeleteRedemptionCode();
  const confirm = useConfirm();

  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dialog, setDialog] = useState<DialogState>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const rows = query.data?.rows ?? [];
  const filtered = useMemo(() => {
    const term = searchValue.trim().toLowerCase();
    return rows.filter((row) => {
      if (statusFilter && row.status !== statusFilter) return false;
      if (term && !row.code.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [rows, searchValue, statusFilter]);

  function commitMaxUses(code: RedemptionCode) {
    setEditingId(null);
    const next = Number(draft);
    if (!Number.isFinite(next) || next < 0 || next === code.maxUses) return;
    update.mutate({ id: code.id, maxUses: next });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Affiliate &amp; codes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Redemption codes for campaigns. Click a max-uses or status cell to
            edit it inline.
          </p>
        </div>
        <Button onClick={() => setDialog({ mode: "create" })}>
          <PlusIcon size={16} />
          New code
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search codes…"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="h-9 w-56"
        />
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value && value !== "all" ? value : "")
          }
        >
          <SelectTrigger className="h-9 w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {redemptionCodeStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                <span className="capitalize">{status}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead className="w-32">Max uses</TableHead>
              <TableHead className="w-44">Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No codes found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((code) => (
                <TableRow key={code.id}>
                  <TableCell className="font-mono text-xs font-medium">
                    {code.code}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {code.discountPercent}%
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {code.usedCount.toLocaleString()} /{" "}
                    {code.maxUses.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {editingId === code.id ? (
                      <Input
                        autoFocus
                        type="number"
                        min={0}
                        className="h-7 w-24"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onBlur={() => commitMaxUses(code)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") commitMaxUses(code);
                          if (event.key === "Escape") setEditingId(null);
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        className="-mx-1 w-full rounded-none px-1 py-1 text-left tabular-nums hover:bg-muted/60"
                        onClick={() => {
                          setEditingId(code.id);
                          setDraft(String(code.maxUses));
                        }}
                      >
                        {code.maxUses.toLocaleString()}
                      </button>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={code.status}
                      onValueChange={(value) => {
                        if (value && value !== code.status) {
                          update.mutate({
                            id: code.id,
                            status: value as RedemptionCodeStatus,
                          });
                        }
                      }}
                    >
                      <SelectTrigger
                        size="sm"
                        className="w-full border-transparent shadow-none hover:border-border"
                      >
                        <StatusChip
                          status={code.status}
                          colorMap={statusColorMap}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {redemptionCodeStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            <span className="capitalize">{status}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <ActionMenu
                        onEdit={() => setDialog({ mode: "edit", code })}
                        onDelete={async () => {
                          const ok = await confirm({
                            title: `Delete ${code.code}?`,
                            description: "This action cannot be undone.",
                            confirmLabel: "Delete",
                            destructive: true,
                          });
                          if (ok) remove.mutate(code.id);
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <RedemptionCodeFormDialog
        open={dialog !== null}
        mode={dialog?.mode ?? "create"}
        code={dialog?.code}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      />
    </div>
  );
}
