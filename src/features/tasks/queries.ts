import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toastError, toastSuccess } from "@/lib/toast";
import type { TaskInput, TaskListParams, TaskUpdate } from "./schema";
import { createTask, deleteTask, listTasks, updateTask } from "./server";

export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (params: TaskListParams) => [...taskKeys.lists(), params] as const,
};

export function tasksListQuery(params: TaskListParams) {
  return queryOptions({
    queryKey: taskKeys.list(params),
    queryFn: () => listTasks({ data: params }),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TaskInput) => createTask({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toastSuccess("Task created");
    },
    onError: (err) => toastError(err, "Failed to create task"),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TaskUpdate) => updateTask({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
    onError: (err) => toastError(err, "Failed to update task"),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTask({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toastSuccess("Task deleted");
    },
    onError: (err) => toastError(err, "Failed to delete task"),
  });
}
