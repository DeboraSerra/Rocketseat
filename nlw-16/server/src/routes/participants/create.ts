import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import nodemailer from "nodemailer";
import { z } from "zod";
import { ClientError } from "../../errors/client-error";
import { createMessage } from "../../helpers/create-invite-message";
import { getMailClient } from "../../lib/mail";
import { prisma } from "../../lib/prisma";

export async function createInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips/:tripId/invites",
    {
      schema: {
        body: z.object({
          email: z.string().email(),
        }),
        params: z.object({
          tripId: z.string().uuid(),
        }),
      },
    },
    async (req, res) => {
      const {
        body: { email },
        params: { tripId },
      } = req;

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        throw new ClientError("Trip not found");
      }

      const participant = await prisma.participant.create({
        data: {
          email,
          trip_id: tripId,
        },
      });

      const mail = await getMailClient();
      const newMessage = createMessage(
        trip.destination,
        trip.ends_at,
        trip.starts_at,
        participant.id
      );

      const message = await mail.sendMail({
        from: {
          name: "Equipe plann.er",
          address: "debs@planner.com",
        },
        to: email,
        subject: newMessage.subject,
        html: newMessage.message,
      });

      console.log(nodemailer.getTestMessageUrl(message));

      return {
        participantId: participant.id,
      };
    }
  );
}
