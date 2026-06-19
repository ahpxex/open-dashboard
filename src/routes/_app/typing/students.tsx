import { PlusIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { StudentCard } from "@/features/students/cards";
import { studentsListConfig } from "@/features/students/config";
import {
  studentsListQuery,
  useDeleteStudent,
} from "@/features/students/queries";
import { StudentFormDialog } from "@/features/students/StudentFormDialog";
import {
  type Student,
  studentListParamsSchema,
} from "@/features/students/schema";
import { CardList, useResourceList } from "@/infra/list";

export const Route = createFileRoute("/_app/typing/students")({
  validateSearch: studentListParamsSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(studentsListQuery(deps)),
  component: StudentsPage,
});

type DialogState = { mode: "create" | "edit"; student?: Student } | null;

function StudentsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { table, rows, total, isLoading, refetch } = useResourceList<
    typeof search,
    Student
  >(search, navigate, studentsListQuery);
  const [dialog, setDialog] = useState<DialogState>(null);

  const remove = useDeleteStudent();
  const confirm = useConfirm();

  const cardContext = {
    onEdit: (student: Student) => setDialog({ mode: "edit", student }),
    onDelete: async (student: Student) => {
      const ok = await confirm({
        title: `Remove “${student.name}”?`,
        description: "This action cannot be undone.",
        confirmLabel: "Remove",
        destructive: true,
      });
      if (ok) remove.mutate(student.id);
    },
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Students
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Learners and their progress, as cards.
        </p>
      </div>

      <CardList
        data={rows}
        total={total}
        isLoading={isLoading}
        getKey={(student) => student.id}
        renderCard={(student) => (
          <StudentCard student={student} context={cardContext} />
        )}
        searchValue={search.search}
        onSearchChange={table.setSearch}
        searchPlaceholder={studentsListConfig.searchPlaceholder}
        onRefresh={refetch}
        page={search.page}
        pageSize={search.pageSize}
        pageSizeOptions={studentsListConfig.pageSizeOptions}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
        emptyMessage={studentsListConfig.emptyMessage}
        toolbarActions={
          <Button onClick={() => setDialog({ mode: "create" })}>
            <PlusIcon size={16} />
            Add student
          </Button>
        }
      />

      <StudentFormDialog
        open={dialog !== null}
        mode={dialog?.mode ?? "create"}
        student={dialog?.student}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      />
    </div>
  );
}
