import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toastError, toastSuccess } from "@/lib/toast";
import type { UserInput, UserListParams, UserUpdate } from "./schema";
import {
  createUser,
  deleteUser,
  deleteUsers,
  getUser,
  listUsers,
  updateUser,
} from "./server";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: UserListParams) => [...userKeys.lists(), params] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
};

export function usersListQuery(params: UserListParams) {
  return queryOptions({
    queryKey: userKeys.list(params),
    queryFn: () => listUsers({ data: params }),
  });
}

export function userDetailQuery(id: string) {
  return queryOptions({
    queryKey: userKeys.detail(id),
    queryFn: () => getUser({ data: id }),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UserInput) => createUser({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toastSuccess("User created");
    },
    onError: (err) => toastError(err, "Failed to create user"),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UserUpdate) => updateUser({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toastSuccess("User updated");
    },
    onError: (err) => toastError(err, "Failed to update user"),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUser({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toastSuccess("User deleted");
    },
    onError: (err) => toastError(err, "Failed to delete user"),
  });
}

export function useBulkDeleteUsers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deleteUsers({ data: ids }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      const n = result.ids.length;
      toastSuccess(`${n} user${n === 1 ? "" : "s"} deleted`);
    },
    onError: (err) => toastError(err, "Failed to delete users"),
  });
}
