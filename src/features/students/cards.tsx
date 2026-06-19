import { Card, CardContent } from "@/components/ui/card";
import { ActionMenu } from "@/infra/ui";
import type { Student } from "./schema";

export interface StudentCardContext {
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 bg-muted/40 p-2">
      <span className="text-sm font-semibold tabular-nums">{value}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

export function StudentCard({
  student,
  context,
}: {
  student: Student;
  context: StudentCardContext;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium">{student.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {student.className}
            </p>
          </div>
          <ActionMenu
            onEdit={() => context.onEdit(student)}
            onDelete={() => context.onDelete(student)}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Metric label="WPM" value={String(student.wpm)} />
          <Metric label="Accuracy" value={`${student.accuracy}%`} />
          <Metric label="Lessons" value={String(student.lessonsDone)} />
        </div>
      </CardContent>
    </Card>
  );
}
