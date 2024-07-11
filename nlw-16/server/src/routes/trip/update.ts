import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { dayjs } from "../../lib/dayJSFormatter";
import { prisma } from "../../lib/prisma";
import { ClientError } from "../../errors/client-error";

export async function updateTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/trips/:tripId",
    {
      schema: {
        body: z.object({
          destination: z.string().min(4),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date(),
        }),
        params: z.object({
          tripId: z.string().uuid(),
        }),
      },
    },
    async (req, res) => {
      const {
        body: { destination, ends_at, starts_at },
        params: { tripId },
      } = req;

      if (
        dayjs(starts_at).isBefore(dayjs()) ||
        dayjs(ends_at).isBefore(starts_at)
      ) {
        throw new ClientError("Invalid dates")
      }

      const tripExists = await prisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!tripExists) {
        throw new ClientError("Trip not found");
      }

      const trip = await prisma.trip.update({
        data: {
          destination,
          starts_at,
          ends_at,
        },
        where: {
          id: tripId,
        },
      });

      return {
        trip,
      };
    }
  );
}
