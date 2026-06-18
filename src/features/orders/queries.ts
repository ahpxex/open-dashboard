import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { OrderInput, OrderListParams, OrderUpdate } from "./schema";
import { createOrders, deleteOrders, listOrders, updateOrders } from "./server";

export const ordersKeys = {
  all: ["orders"] as const,
  lists: () => [...ordersKeys.all, "list"] as const,
  list: (params: OrderListParams) => [...ordersKeys.lists(), params] as const,
};

export function ordersListQuery(params: OrderListParams) {
  return queryOptions({
    queryKey: ordersKeys.list(params),
    queryFn: () => listOrders({ data: params }),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OrderInput) => createOrders({ data: input }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ordersKeys.all }),
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OrderUpdate) => updateOrders({ data: input }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ordersKeys.all }),
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOrders({ data: id }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ordersKeys.all }),
  });
}
