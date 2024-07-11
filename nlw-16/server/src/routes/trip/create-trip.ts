import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import nodemailer from "nodemailer";
import { z } from "zod";
import { getMailClient } from "../../lib/mail";
import { prisma } from "../../lib/prisma";

dayjs.extend(localizedFormat);
dayjs.locale("pt-br");

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
        return res.status(400).send({ message: "Invalid dates" });
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

      const message = await mail.sendMail({
        from: {
          name: "Equipe plann.er",
          address: "debs@planner.com",
        },
        to: {
          name: owner_name,
          address: owner_email,
        },
        subject: `Confirme sua viagem para ${destination}`,
        html: `
        <div style="font-size: 16px; font-family: sans-serif; line-height: 1.6">
          <p>
            Você solicitou a criação de uma viagem para <strong>${destination}</strong>,
            nas datas de <strong>${dayjs(starts_at).format("LL")}</strong> a
            <strong>${dayjs(ends_at).format("LL")}</strong>
          </p>
          <p></p>
          <p>Para confirmar sua viagem, clique no link abaixo</p>
          <p></p>
          <p>
            <a href="http://localhost:3333/trips/${trip.id}/confirm">
              Confirmar viagem
            </a>
          </p>
          <p></p>
          <p>
            Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail
          </p>
        </div>
        `.trim(),
      });

      console.log(nodemailer.getTestMessageUrl(message));

      return {
        tripId: trip.id,
      };
    }
  );
}
