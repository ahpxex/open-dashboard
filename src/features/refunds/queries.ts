import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toastError, toastSuccess } from "@/lib/toast";
import type { RefundInput, RefundListParams, RefundUpdate } from "./schema";
import {
  createRefund,
  deleteRefund,
  listRefunds,
  updateRefund,
} from "./server";

export const refundKeys = {
  all: ["refunds"] as const,
  lists: () => [...refundKeys.all, "list"] as const,
  list: (params: RefundListParams) => [...refundKeys.lists(), params] as const,
};

export function refundsListQuery(params: RefundListParams) {
  return queryOptions({
    queryKey: refundKeys.list(params),
    queryFn: () => listRefunds({ data: params }),
  });
}

export function useCreateRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RefundInput) => createRefund({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: refundKeys.all });
      toastSuccess("Refund created");
    },
    onError: (err) => toastError(err, "Failed to create refund"),
  });
}

export function useUpdateRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RefundUpdate) => updateRefund({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: refundKeys.all });
      toastSuccess("Refund updated");
    },
    onError: (err) => toastError(err, "Failed to update refund"),
  });
}

export function useDeleteRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRefund({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: refundKeys.all });
      toastSuccess("Refund deleted");
    },
    onError: (err) => toastError(err, "Failed to delete refund"),
  });
}
