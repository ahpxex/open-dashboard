import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toastError, toastSuccess } from "@/lib/toast";
import type { CompanyInput, CompanyListParams, CompanyUpdate } from "./schema";
import {
  createCompany,
  deleteCompany,
  getCompany,
  listCompanies,
  updateCompany,
} from "./server";

export const companyKeys = {
  all: ["companies"] as const,
  lists: () => [...companyKeys.all, "list"] as const,
  list: (params: CompanyListParams) =>
    [...companyKeys.lists(), params] as const,
  detail: (id: string) => [...companyKeys.all, "detail", id] as const,
};

export function companiesListQuery(params: CompanyListParams) {
  return queryOptions({
    queryKey: companyKeys.list(params),
    queryFn: () => listCompanies({ data: params }),
  });
}

export function companyDetailQuery(id: string) {
  return queryOptions({
    queryKey: companyKeys.detail(id),
    queryFn: () => getCompany({ data: id }),
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CompanyInput) => createCompany({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
      toastSuccess("Company created");
    },
    onError: (err) => toastError(err, "Failed to create company"),
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CompanyUpdate) => updateCompany({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
      toastSuccess("Company updated");
    },
    onError: (err) => toastError(err, "Failed to update company"),
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCompany({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
      toastSuccess("Company deleted");
    },
    onError: (err) => toastError(err, "Failed to delete company"),
  });
}
