import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toastError, toastSuccess } from "@/lib/toast";
import type { ArticleInput, ArticleListParams, ArticleUpdate } from "./schema";
import {
  createArticle,
  deleteArticle,
  listArticles,
  updateArticle,
} from "./server";

export const articleKeys = {
  all: ["articles"] as const,
  lists: () => [...articleKeys.all, "list"] as const,
  list: (params: ArticleListParams) =>
    [...articleKeys.lists(), params] as const,
};

export function articlesListQuery(params: ArticleListParams) {
  return queryOptions({
    queryKey: articleKeys.list(params),
    queryFn: () => listArticles({ data: params }),
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ArticleInput) => createArticle({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.all });
      toastSuccess("Article created");
    },
    onError: (err) => toastError(err, "Failed to create article"),
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ArticleUpdate) => updateArticle({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.all });
      toastSuccess("Article updated");
    },
    onError: (err) => toastError(err, "Failed to update article"),
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteArticle({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.all });
      toastSuccess("Article deleted");
    },
    onError: (err) => toastError(err, "Failed to delete article"),
  });
}
