import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { TicketsResponse } from '@/server/schemas/ticket-schemas';
import { orpc } from '@/utils/orpc';

export const useTickets = () => {
  const { data, ...rest } = useQuery(
    orpc.ticket.getAll.queryOptions({
      staleTime: 1000 * 60 * 5,
    }),
  );

  return {
    tickets: data?.tickets || [],
    total: data?.total || 0,
    ...rest,
  };
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  const { mutate: createTicketMutation, ...rest } = useMutation(
    orpc.ticket.create.mutationOptions({
      onMutate: async (newTicket) => {
        await queryClient.cancelQueries({
          queryKey: orpc.ticket.getAll.queryKey(),
        });

        const previousTickets = queryClient.getQueriesData<TicketsResponse>({
          queryKey: orpc.ticket.getAll.queryKey(),
        });

        queryClient.setQueriesData(
          { queryKey: orpc.ticket.getAll.queryKey() },
          (old: TicketsResponse) => {
            if (!old) return old;
            return {
              ...old,
              tickets: [...old.tickets, { ...newTicket, id: Math.random().toString() }],
              total: old.total + 1,
            };
          },
        );

        return { previousTickets };
      },
      onError: (error, variables, context) => {
        if (context?.previousTickets) {
          Object.entries(context.previousTickets).forEach(([queryKey, data]) => {
            queryClient.setQueryData([queryKey], data);
          });
        }

        toast.error(`Failed to create ticket "${variables.title}". ${error.message}`);
      },
      onSuccess: () => {
        toast.success('Ticket created successfully');
      },
      onSettled: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.ticket.getAll.queryKey(),
        });
      },
    }),
  );

  return { createTicketMutation, ...rest };
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();

  const { mutate: updateTicketMutation, ...rest } = useMutation(
    orpc.ticket.update.mutationOptions({
      onMutate: async ({ id, data }) => {
        await queryClient.cancelQueries({
          queryKey: orpc.ticket.getAll.queryKey(),
        });

        const previousTickets = queryClient.getQueriesData<TicketsResponse>({
          queryKey: orpc.ticket.getAll.queryKey(),
        });

        queryClient.setQueriesData(
          { queryKey: orpc.ticket.getAll.queryKey() },
          (old: TicketsResponse) => {
            if (!old) return old;
            return {
              ...old,
              tickets: old.tickets.map((ticket) =>
                ticket.id === id ? { ...ticket, ...data } : ticket,
              ),
            };
          },
        );

        return { previousTickets };
      },
      onError: (error, variables, context) => {
        if (context?.previousTickets) {
          Object.entries(context.previousTickets).forEach(([queryKey, data]) => {
            queryClient.setQueryData([queryKey], data);
          });
        }

        toast.error(`Failed to update ticket "${variables.id}". ${error.message}`);
      },
      onSuccess: (_, variables) => {
        toast.success(`Ticket "${variables.id}" updated successfully`);
      },
      onSettled: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.ticket.getAll.queryKey(),
        });
      },
    }),
  );

  return { updateTicketMutation, ...rest };
};

export const useDeleteTicket = () => {
  const queryClient = useQueryClient();

  const { mutate: deleteTicketMutation, ...rest } = useMutation(
    orpc.ticket.delete.mutationOptions({
      onMutate: async ({ id }) => {
        await queryClient.cancelQueries({
          queryKey: orpc.ticket.getAll.queryKey(),
        });

        const previousTickets = queryClient.getQueriesData<TicketsResponse>({
          queryKey: orpc.ticket.getAll.queryKey(),
        });

        queryClient.setQueriesData(
          { queryKey: orpc.ticket.getAll.queryKey() },
          (old: TicketsResponse) => {
            if (!old) return old;
            return {
              ...old,
              tickets: old.tickets.filter((ticket) => ticket.id !== id),
              total: old.total - 1,
            };
          },
        );

        return { previousTickets };
      },
      onError: (error, variables, context) => {
        if (context?.previousTickets) {
          Object.entries(context.previousTickets).forEach(([queryKey, data]) => {
            queryClient.setQueryData([queryKey], data);
          });
        }

        toast.error(`Failed to delete ticket "${variables.id}". ${error.message}`);
      },
      onSuccess: (_, variables) => {
        toast.success(`Ticket "${variables.id}" deleted successfully`);
      },
      onSettled: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.ticket.getAll.queryKey(),
        });
      },
    }),
  );

  return { deleteTicketMutation, ...rest };
};
