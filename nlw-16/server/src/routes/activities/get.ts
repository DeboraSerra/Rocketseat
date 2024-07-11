import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { dayjs } from "../../lib/dayJSFormatter";
import { prisma } from "../../lib/prisma";

export async function getActivities(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/trips/:tripId/activities",
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
          activities: {
            orderBy: {
              occurs_at: "asc",
            },
          },
        },
      });

      if (!trip) {
        throw new Error("Trip not found");
      }

      const differenceBetweenStartAndEnd = dayjs(trip.ends_at).diff(
        trip.starts_at,
        "days"
      );

      const activities = Array.from({
        length: differenceBetweenStartAndEnd + 1,
      }).map((_, i) => {
        const date = dayjs(trip.starts_at).add(i, "days");
        return {
          date: date.toDate(),
          activities: trip.activities.filter(({ occurs_at }) => {
            return dayjs(occurs_at).isSame(date, "day");
          }),
        };
      });

      return {
        activities,
      };
    }
  );
}
