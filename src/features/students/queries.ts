import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toastError, toastSuccess } from "@/lib/toast";
import type { StudentInput, StudentListParams, StudentUpdate } from "./schema";
import {
  createStudent,
  deleteStudent,
  listStudents,
  updateStudent,
} from "./server";

export const studentKeys = {
  all: ["students"] as const,
  lists: () => [...studentKeys.all, "list"] as const,
  list: (params: StudentListParams) =>
    [...studentKeys.lists(), params] as const,
};

export function studentsListQuery(params: StudentListParams) {
  return queryOptions({
    queryKey: studentKeys.list(params),
    queryFn: () => listStudents({ data: params }),
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StudentInput) => createStudent({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
      toastSuccess("Student added");
    },
    onError: (err) => toastError(err, "Failed to add student"),
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StudentUpdate) => updateStudent({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
      toastSuccess("Student updated");
    },
    onError: (err) => toastError(err, "Failed to update student"),
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStudent({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
      toastSuccess("Student removed");
    },
    onError: (err) => toastError(err, "Failed to remove student"),
  });
}
