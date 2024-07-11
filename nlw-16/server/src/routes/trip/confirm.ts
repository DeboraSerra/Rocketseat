import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import nodemailer from "nodemailer";
import { z } from "zod";
import { env } from "../../env";
import { ClientError } from "../../errors/client-error";
import { createMessage } from "../../helpers/create-invite-message";
import { getMailClient } from "../../lib/mail";
import { prisma } from "../../lib/prisma";

export async function confirmTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/trips/:tripId/confirm",
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
            where: {
              is_owner: false,
            },
          },
        },
      });

      if (!trip) {
        throw new ClientError("Trip not found");
      }

      if (trip.is_confirmed) {
        return res.redirect(`${env.WEB_BASE_URL}/trips/${tripId}`);
      }

      await prisma.trip.update({
        where: { id: tripId },
        data: { is_confirmed: true },
      });
      //const participants = await prisma.participant.findMany({
      //  where: { trip_id: tripId, is_owner: false },
      //});

      const mail = await getMailClient();

      const messages = await Promise.all(
        trip.participants.map(async (p) => {
          const newMessage = createMessage(
            trip.destination,
            trip.ends_at,
            trip.starts_at,
            p.id
          );
          const message = await mail.sendMail({
            from: {
              name: "Equipe plann.er",
              address: "debs@planner.com",
            },
            to: p.email,
            subject: newMessage.subject,
            html: newMessage.message,
          });
          return nodemailer.getTestMessageUrl(message);
        })
      );

      console.log(messages);

      return res.redirect(`${env.WEB_BASE_URL}/trips/${tripId}`);
    }
  );
}
