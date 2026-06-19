import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toastError, toastSuccess } from "@/lib/toast";
import type { EmployeeInput, EmployeeListParams } from "./schema";
import { createEmployee, listEmployees } from "./server";

export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (params: EmployeeListParams) =>
    [...employeeKeys.lists(), params] as const,
};

export function employeesListQuery(params: EmployeeListParams) {
  return queryOptions({
    queryKey: employeeKeys.list(params),
    queryFn: () => listEmployees({ data: params }),
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EmployeeInput) => createEmployee({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      toastSuccess("Employee added");
    },
    onError: (err) => toastError(err, "Failed to add employee"),
  });
}
