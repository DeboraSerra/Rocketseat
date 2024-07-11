import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import nodemailer from "nodemailer";
import { z } from "zod";
import { dayjs } from "../../lib/dayJSFormatter";
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
        throw new Error("Trip not found");
      }

      if (trip.is_confirmed) {
        return res.redirect(`http://localhost:3000/trips/${tripId}`);
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
          const message = await mail.sendMail({
            from: {
              name: "Equipe plann.er",
              address: "debs@planner.com",
            },
            to: p.email,
            subject: `Confirme sua presença na viagem para ${trip.destination}`,
            html: `
          <div style="font-size: 16px; font-family: sans-serif; line-height: 1.6">
            <p>
              Você foi convidado para participar de uma viagem para <strong>${
                trip.destination
              }</strong>,
              nas datas de <strong>${dayjs(trip.starts_at).format(
                "LL"
              )}</strong> a
              <strong>${dayjs(trip.ends_at).format("LL")}</strong>
            </p>
            <p></p>
            <p>Para confirmar sua presença na viagem, clique no link abaixo:</p>
            <p></p>
            <p>
              <a href="http://localhost:3333/participants/${p.id}/confirm">
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
          return nodemailer.getTestMessageUrl(message);
        })
      );

      console.log(messages);

      return res.redirect(`http://localhost:3000/trips/${tripId}`);
    }
  );
}
