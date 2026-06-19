import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toastError, toastSuccess } from "@/lib/toast";
import type {
  RedemptionCodeInput,
  RedemptionCodeListParams,
  RedemptionCodeUpdate,
} from "./schema";
import {
  createRedemptionCode,
  deleteRedemptionCode,
  listRedemptionCodes,
  updateRedemptionCode,
} from "./server";

export const redemptionCodeKeys = {
  all: ["redemption-codes"] as const,
  lists: () => [...redemptionCodeKeys.all, "list"] as const,
  list: (params: RedemptionCodeListParams) =>
    [...redemptionCodeKeys.lists(), params] as const,
};

export function redemptionCodesListQuery(params: RedemptionCodeListParams) {
  return queryOptions({
    queryKey: redemptionCodeKeys.list(params),
    queryFn: () => listRedemptionCodes({ data: params }),
  });
}

export function useCreateRedemptionCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RedemptionCodeInput) =>
      createRedemptionCode({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: redemptionCodeKeys.all });
      toastSuccess("Code created");
    },
    onError: (err) => toastError(err, "Failed to create code"),
  });
}

export function useUpdateRedemptionCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RedemptionCodeUpdate) =>
      updateRedemptionCode({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: redemptionCodeKeys.all });
    },
    onError: (err) => toastError(err, "Failed to update code"),
  });
}

export function useDeleteRedemptionCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRedemptionCode({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: redemptionCodeKeys.all });
      toastSuccess("Code deleted");
    },
    onError: (err) => toastError(err, "Failed to delete code"),
  });
}
