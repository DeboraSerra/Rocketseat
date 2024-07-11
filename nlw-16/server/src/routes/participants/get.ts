import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prisma";

export async function getParticipants(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/trips/:tripId/participants",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
      },
    },
    async (req, res) => {
      const {
        params: { tripId },
      } = req;

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          participants: {
            orderBy: {
              is_confirmed: "desc",
            },
            select: {
              id: true,
              name: true,
              email: true,
              is_confirmed: true,
            },
          },
        },
      });

      if (!trip) {
        throw new Error("Trip not found");
      }

      return {
        participants: trip.participants,
      };
    }
  );
}