import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toastError, toastSuccess } from "@/lib/toast";
import type { DealInput, DealListParams, DealUpdate } from "./schema";
import { createDeal, deleteDeal, listDeals, updateDeal } from "./server";

export const dealKeys = {
  all: ["deals"] as const,
  lists: () => [...dealKeys.all, "list"] as const,
  list: (params: DealListParams) => [...dealKeys.lists(), params] as const,
};

export function dealsListQuery(params: DealListParams) {
  return queryOptions({
    queryKey: dealKeys.list(params),
    queryFn: () => listDeals({ data: params }),
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DealInput) => createDeal({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealKeys.all });
      toastSuccess("Deal created");
    },
    onError: (err) => toastError(err, "Failed to create deal"),
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DealUpdate) => updateDeal({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealKeys.all });
    },
    onError: (err) => toastError(err, "Failed to update deal"),
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDeal({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealKeys.all });
      toastSuccess("Deal deleted");
    },
    onError: (err) => toastError(err, "Failed to delete deal"),
  });
}
