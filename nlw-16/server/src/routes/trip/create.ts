import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import nodemailer from "nodemailer";
import { z } from "zod";
import { ClientError } from "../../errors/client-error";
import { createMessage } from "../../helpers/create-trip-message";
import { dayjs } from "../../lib/dayJSFormatter";
import { getMailClient } from "../../lib/mail";
import { prisma } from "../../lib/prisma";

export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips",
    {
      schema: {
        body: z.object({
          destination: z.string().min(4),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date(),
          owner_name: z.string(),
          owner_email: z.string().email(),
          emails_to_invite: z.array(z.string().email()),
        }),
      },
    },
    async (req, res) => {
      const {
        body: {
          destination,
          ends_at,
          starts_at,
          owner_email,
          owner_name,
          emails_to_invite,
        },
      } = req;

      if (
        dayjs(starts_at).isBefore(dayjs()) ||
        dayjs(ends_at).isBefore(starts_at)
      ) {
        throw new ClientError("Invalid dates");
      }

      const trip = await prisma.trip.create({
        data: {
          destination,
          starts_at,
          ends_at,
          participants: {
            createMany: {
              data: [
                {
                  name: owner_name,
                  email: owner_email,
                  is_owner: true,
                  is_confirmed: true,
                },
                ...emails_to_invite.map((email) => ({
                  email,
                })),
              ],
            },
          },
        },
      });

      const mail = await getMailClient();
      const newMessage = createMessage(
        destination,
        ends_at,
        starts_at,
        trip.id
      );

      const message = await mail.sendMail({
        from: {
          name: "Equipe plann.er",
          address: "debs@planner.com",
        },
        to: {
          name: owner_name,
          address: owner_email,
        },
        subject: newMessage.subject,
        html: newMessage.message,
      });

      console.log(nodemailer.getTestMessageUrl(message));

      return {
        tripId: trip.id,
      };
    }
  );
}
