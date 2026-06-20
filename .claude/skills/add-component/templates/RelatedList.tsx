import { TrayIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

/** One column of a `RelatedList`: a header and a per-row cell renderer. */
export interface RelatedColumn<T> {
  /** Column header text. */
  header: ReactNode;
  /** Cell for a given row. */
  cell: (row: T) => ReactNode;
  /** Right-align the header and cells (numbers, money). */
  align?: "left" | "right";
  /** Extra classes for the cell. */
  className?: string;
}

export interface RelatedListProps<T> {
  /** Section title (e.g. "Orders"). */
  title: ReactNode;
  /** The child records, already scoped to the parent record. */
  rows: T[];
  /** Column definitions. */
  columns: RelatedColumn<T>[];
  /** Stable key for a row. */
  rowKey: (row: T) => string;
  /** Optional "View all" target shown in the header. */
  viewAll?: { to: string; label?: ReactNode };
  /** Optional trailing action cell rendered per row (e.g. a link or menu). */
  rowAction?: (row: T) => ReactNode;
  /** Empty-state message when there are no rows. */
  emptyMessage?: ReactNode;
  className?: string;
}

/**
 * A titled section that renders related child records of a parent as a compact
 * table. Generic over the row type: pass `columns` (header + cell renderer),
 * a `rowKey`, optional per-row `rowAction` and a "View all" link. Falls back to
 * a clean empty state. Presentational — fetch the rows (a child list query
 * filtered by the parent id) in the page and pass them in.
 */
export function RelatedList<T>({
  title,
  rows,
  columns,
  rowKey,
  viewAll,
  rowAction,
  emptyMessage = "Nothing here yet.",
  className,
}: RelatedListProps<T>) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          {title}
          <span className="text-xs font-normal text-muted-foreground">
            {rows.length}
          </span>
        </h3>
        {viewAll ? (
          <Link
            to={viewAll.to}
            className="text-xs text-primary hover:underline"
          >
            {viewAll.label ?? "View all"}
          </Link>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-border bg-muted/20 px-4 py-8 text-center">
          <TrayIcon size={22} className="text-muted-foreground" />
          <p className="text-xs text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead
                    key={index}
                    className={cn(column.align === "right" && "text-right")}
                  >
                    {column.header}
                  </TableHead>
                ))}
                {rowAction ? (
                  <TableHead className="w-0 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={rowKey(row)}>
                  {columns.map((column, index) => (
                    <TableCell
                      key={index}
                      className={cn(
                        column.align === "right" && "text-right",
                        column.className,
                      )}
                    >
                      {column.cell(row)}
                    </TableCell>
                  ))}
                  {rowAction ? (
                    <TableCell className="text-right">
                      {rowAction(row)}
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
