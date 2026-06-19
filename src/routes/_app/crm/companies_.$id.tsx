import {
  CaretRightIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  notFound,
  useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyFormDialog } from "@/features/companies/CompanyFormDialog";
import { industryColorMap, industryLabelMap } from "@/features/companies/cards";
import {
  companyDetailQuery,
  useDeleteCompany,
} from "@/features/companies/queries";
import { DescriptionList, StatusChip } from "@/infra/ui";

export const Route = createFileRoute("/_app/crm/companies_/$id")({
  loader: async ({ context, params }) => {
    const company = await context.queryClient.ensureQueryData(
      companyDetailQuery(params.id),
    );
    if (!company) throw notFound();
    return { company };
  },
  component: CompanyDetailPage,
});

function CompanyDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const deleteCompany = useDeleteCompany();
  const [editing, setEditing] = useState(false);

  const query = useQuery(companyDetailQuery(id));
  const company = query.data;

  if (query.isLoading && !company) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold">Company not found</h1>
        <Link to="/crm/companies" className="text-sm underline">
          Back to companies
        </Link>
      </div>
    );
  }

  async function onDelete() {
    if (!company) return;
    const ok = await confirm({
      title: `Delete “${company.name}”?`,
      description: "This action cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) {
      await deleteCompany.mutateAsync(company.id);
      navigate({ to: "/crm/companies" });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link
          to="/crm/companies"
          className="hover:text-foreground hover:underline"
        >
          Companies
        </Link>
        <CaretRightIcon size={12} />
        <span className="text-foreground">{company.name}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {company.name}
          </h1>
          <StatusChip
            status={company.industry}
            colorMap={industryColorMap}
            labelMap={industryLabelMap}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditing(true)}>
            <PencilSimpleIcon size={16} />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={deleteCompany.isPending}
          >
            <TrashIcon size={16} />
            Delete
          </Button>
        </div>
      </div>

      <div className="border border-border p-6">
        <DescriptionList
          columns={3}
          items={[
            {
              label: "Industry",
              value: (
                <StatusChip
                  status={company.industry}
                  colorMap={industryColorMap}
                  labelMap={industryLabelMap}
                />
              ),
            },
            { label: "Staff", value: company.size.toLocaleString() },
            { label: "Location", value: company.location },
            { label: "Website", value: company.website },
            {
              label: "Added",
              value: new Date(company.createdAt).toLocaleDateString(),
            },
          ]}
        />
      </div>

      <CompanyFormDialog
        open={editing}
        mode="edit"
        company={company}
        onOpenChange={setEditing}
      />
    </div>
  );
}
