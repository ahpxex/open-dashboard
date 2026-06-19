import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toastError, toastSuccess } from "@/lib/toast";
import type { ClassInput, ClassListParams, ClassUpdate } from "./schema";
import { createClass, deleteClass, listClasses, updateClass } from "./server";

export const classKeys = {
  all: ["classes"] as const,
  lists: () => [...classKeys.all, "list"] as const,
  list: (params: ClassListParams) => [...classKeys.lists(), params] as const,
};

export function classesListQuery(params: ClassListParams) {
  return queryOptions({
    queryKey: classKeys.list(params),
    queryFn: () => listClasses({ data: params }),
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ClassInput) => createClass({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      toastSuccess("Class created");
    },
    onError: (err) => toastError(err, "Failed to create class"),
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ClassUpdate) => updateClass({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      toastSuccess("Class updated");
    },
    onError: (err) => toastError(err, "Failed to update class"),
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClass({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      toastSuccess("Class deleted");
    },
    onError: (err) => toastError(err, "Failed to delete class"),
  });
}
