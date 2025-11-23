import { ORPCError } from '@orpc/server';
import z from 'zod';
import { publicProcedure } from '@/server/orpc';
import { prisma } from '@/server/prisma';
import {
  createTicketSchema,
  ticketIdSchema,
  ticketResponseSchema,
  updateTicketSchema,
} from '@/server/schemas/ticket-schemas';

export const ticketRouter = {
  list: publicProcedure
    .route({ method: 'GET', path: '/tickets' })
    .output(z.object({ tickets: z.array(ticketResponseSchema), total: z.number() }))
    .handler(async () => {
      const [tickets, total] = await prisma.$transaction([
        prisma.ticket.findMany(),
        prisma.ticket.count(),
      ]);

      return {
        tickets,
        total,
      };
    }),

  find: publicProcedure
    .route({ method: 'GET', path: '/tickets/{id}' })
    .input(ticketIdSchema)
    .output(ticketResponseSchema)
    .handler(async ({ input }) => {
      const ticket = await prisma.ticket.findUnique({
        where: { id: input.id },
      });

      if (!ticket) {
        throw new ORPCError('NOT_FOUND', {
          message: `Ticket with id ${input.id} not found`,
        });
      }

      return ticket;
    }),

  create: publicProcedure
    .route({ method: 'POST', path: '/tickets' })
    .input(createTicketSchema)
    .output(ticketResponseSchema)
    .handler(async ({ input }) => {
      return prisma.ticket.create({
        data: input,
      });
    }),

  update: publicProcedure
    .route({ method: 'PUT', path: '/tickets/{id}' })
    .input(updateTicketSchema)
    .output(ticketResponseSchema)
    .handler(async ({ input }) => {
      const ticket = await prisma.ticket.findUnique({
        where: { id: input.id },
      });

      if (!ticket) {
        throw new ORPCError('NOT_FOUND', {
          message: `Ticket with id ${input.id} not found`,
        });
      }

      return prisma.ticket.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  delete: publicProcedure
    .route({ method: 'DELETE', path: '/tickets/{id}' })
    .input(ticketIdSchema)
    .output(ticketResponseSchema)
    .handler(async ({ input }) => {
      const ticket = await prisma.ticket.findUnique({
        where: { id: input.id },
      });

      if (!ticket) {
        throw new ORPCError('NOT_FOUND', {
          message: `Ticket with id ${input.id} not found`,
        });
      }

      return prisma.ticket.delete({
        where: { id: input.id },
      });
    }),
};
