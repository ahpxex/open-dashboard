import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toastError, toastSuccess } from "@/lib/toast";
import type { TicketInput, TicketListParams, TicketUpdate } from "./schema";
import {
  createTicket,
  deleteTicket,
  getTicket,
  listTickets,
  updateTicket,
} from "./server";

export const ticketKeys = {
  all: ["tickets"] as const,
  lists: () => [...ticketKeys.all, "list"] as const,
  list: (params: TicketListParams) => [...ticketKeys.lists(), params] as const,
  detail: (id: string) => [...ticketKeys.all, "detail", id] as const,
};

export function ticketsListQuery(params: TicketListParams) {
  return queryOptions({
    queryKey: ticketKeys.list(params),
    queryFn: () => listTickets({ data: params }),
  });
}

export function ticketDetailQuery(id: string) {
  return queryOptions({
    queryKey: ticketKeys.detail(id),
    queryFn: () => getTicket({ data: id }),
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TicketInput) => createTicket({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.all });
      toastSuccess("Ticket created");
    },
    onError: (err) => toastError(err, "Failed to create ticket"),
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TicketUpdate) => updateTicket({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.all });
    },
    onError: (err) => toastError(err, "Failed to update ticket"),
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTicket({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.all });
      toastSuccess("Ticket deleted");
    },
    onError: (err) => toastError(err, "Failed to delete ticket"),
  });
}
