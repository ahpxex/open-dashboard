import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toastError, toastSuccess } from "@/lib/toast";
import type { LeaveInput, LeaveListParams, LeaveUpdate } from "./schema";
import {
  createLeaveRequest,
  deleteLeaveRequest,
  listLeaveRequests,
  updateLeaveRequest,
} from "./server";

export const leaveKeys = {
  all: ["leave-requests"] as const,
  lists: () => [...leaveKeys.all, "list"] as const,
  list: (params: LeaveListParams) => [...leaveKeys.lists(), params] as const,
};

export function leaveRequestsListQuery(params: LeaveListParams) {
  return queryOptions({
    queryKey: leaveKeys.list(params),
    queryFn: () => listLeaveRequests({ data: params }),
  });
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LeaveInput) => createLeaveRequest({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
      toastSuccess("Leave requested");
    },
    onError: (err) => toastError(err, "Failed to request leave"),
  });
}

export function useUpdateLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LeaveUpdate) => updateLeaveRequest({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
      toastSuccess("Leave updated");
    },
    onError: (err) => toastError(err, "Failed to update leave"),
  });
}

export function useDeleteLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLeaveRequest({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
      toastSuccess("Leave removed");
    },
    onError: (err) => toastError(err, "Failed to remove leave"),
  });
}
