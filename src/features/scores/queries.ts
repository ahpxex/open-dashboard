import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toastError, toastSuccess } from "@/lib/toast";
import type { ScoreInput, ScoreListParams, ScoreUpdate } from "./schema";
import { createScore, deleteScore, listScores, updateScore } from "./server";

export const scoreKeys = {
  all: ["scores"] as const,
  lists: () => [...scoreKeys.all, "list"] as const,
  list: (params: ScoreListParams) => [...scoreKeys.lists(), params] as const,
};

export function scoresListQuery(params: ScoreListParams) {
  return queryOptions({
    queryKey: scoreKeys.list(params),
    queryFn: () => listScores({ data: params }),
  });
}

export function useCreateScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ScoreInput) => createScore({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scoreKeys.all });
      toastSuccess("Score added");
    },
    onError: (err) => toastError(err, "Failed to add score"),
  });
}

export function useUpdateScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ScoreUpdate) => updateScore({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scoreKeys.all });
    },
    onError: (err) => toastError(err, "Failed to update score"),
  });
}

export function useDeleteScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteScore({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scoreKeys.all });
      toastSuccess("Score removed");
    },
    onError: (err) => toastError(err, "Failed to remove score"),
  });
}
