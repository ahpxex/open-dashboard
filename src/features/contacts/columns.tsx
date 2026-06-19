import type { ColumnDef } from "@tanstack/react-table";
import { ActionMenu } from "@/infra/ui";
import type { Contact } from "./schema";

export interface ContactsTableContext {
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

export function createContactsColumns(
  context: ContactsTableContext,
): ColumnDef<Contact>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: (info) => (
        <span className="font-medium">{info.getValue() as string}</span>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      enableSorting: false,
      cell: (info) => (
        <span className="text-muted-foreground">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "company",
      header: "Company",
      cell: (info) => info.getValue() as string,
    },
    {
      accessorKey: "email",
      header: "Email",
      enableSorting: false,
      cell: (info) => (
        <span className="font-mono text-xs text-muted-foreground">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      enableSorting: false,
      cell: (info) => (
        <span className="font-mono text-xs text-muted-foreground">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: (info) => {
        const contact = info.row.original;
        return (
          <div className="flex justify-end">
            <ActionMenu
              onEdit={() => context.onEdit(contact)}
              onDelete={() => context.onDelete(contact)}
            />
          </div>
        );
      },
    },
  ];
}
