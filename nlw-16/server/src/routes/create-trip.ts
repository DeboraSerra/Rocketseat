import dayjs from "dayjs";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { getMailClient } from "../lib/mail";
import { prisma } from "../lib/prisma";
import nodemailer from "nodemailer" 
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
        }),
      },
    },
    async (req, res) => {
      const {
        body: { destination, ends_at, starts_at, owner_email, owner_name },
      } = req;

      if (
        dayjs(starts_at).isBefore(dayjs()) ||
        dayjs(ends_at).isBefore(starts_at)
      ) {
        return res.status(400).send({ message: "Invalid dates" });
      }

      const trip = await prisma.trip.create({
        data: { destination, starts_at, ends_at },
      });

      const mail = await getMailClient();

      const message = await mail.sendMail({
        from: {
          name: "Equipe plann.er",
          address: "debs@planner.com",
        },
        to: {
          name: owner_name,
          address: owner_email,
        },
        subject: "Teste",
        html: "Teste",
      });

      console.log(nodemailer.getTestMessageUrl(message));

      return {
        tripId: trip.id,
      };
    }
  );
}
