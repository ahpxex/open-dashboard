import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toastError, toastSuccess } from "@/lib/toast";
import type {
  CustomerInput,
  CustomerListParams,
  CustomerUpdate,
} from "./schema";
import {
  createCustomer,
  deleteCustomer,
  deleteCustomers,
  getCustomer,
  listCustomers,
  updateCustomer,
} from "./server";

export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (params: CustomerListParams) =>
    [...customerKeys.lists(), params] as const,
  detail: (id: string) => [...customerKeys.all, "detail", id] as const,
};

export function customersListQuery(params: CustomerListParams) {
  return queryOptions({
    queryKey: customerKeys.list(params),
    queryFn: () => listCustomers({ data: params }),
  });
}

export function customerDetailQuery(id: string) {
  return queryOptions({
    queryKey: customerKeys.detail(id),
    queryFn: () => getCustomer({ data: id }),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CustomerInput) => createCustomer({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      toastSuccess("Customer created");
    },
    onError: (err) => toastError(err, "Failed to create customer"),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CustomerUpdate) => updateCustomer({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      toastSuccess("Customer updated");
    },
    onError: (err) => toastError(err, "Failed to update customer"),
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCustomer({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      toastSuccess("Customer deleted");
    },
    onError: (err) => toastError(err, "Failed to delete customer"),
  });
}

export function useBulkDeleteCustomers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deleteCustomers({ data: ids }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      const n = result.ids.length;
      toastSuccess(`${n} customer${n === 1 ? "" : "s"} deleted`);
    },
    onError: (err) => toastError(err, "Failed to delete customers"),
  });
}
