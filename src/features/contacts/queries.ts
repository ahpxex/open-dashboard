import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toastError, toastSuccess } from "@/lib/toast";
import type { ContactInput, ContactListParams, ContactUpdate } from "./schema";
import {
  createContact,
  deleteContact,
  listContacts,
  updateContact,
} from "./server";

export const contactKeys = {
  all: ["contacts"] as const,
  lists: () => [...contactKeys.all, "list"] as const,
  list: (params: ContactListParams) =>
    [...contactKeys.lists(), params] as const,
};

export function contactsListQuery(params: ContactListParams) {
  return queryOptions({
    queryKey: contactKeys.list(params),
    queryFn: () => listContacts({ data: params }),
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ContactInput) => createContact({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
      toastSuccess("Contact created");
    },
    onError: (err) => toastError(err, "Failed to create contact"),
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ContactUpdate) => updateContact({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
      toastSuccess("Contact updated");
    },
    onError: (err) => toastError(err, "Failed to update contact"),
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteContact({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
      toastSuccess("Contact deleted");
    },
    onError: (err) => toastError(err, "Failed to delete contact"),
  });
}
