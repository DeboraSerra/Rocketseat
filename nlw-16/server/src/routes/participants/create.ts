import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import nodemailer from "nodemailer";
import { z } from "zod";
import { dayjs } from "../../lib/dayJSFormatter";
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
        throw new Error("Trip not found");
      }

      const participant = await prisma.participant.create({
        data: {
          email,
          trip_id: tripId,
        },
      });

      const mail = await getMailClient();

      const message = await mail.sendMail({
        from: {
          name: "Equipe plann.er",
          address: "debs@planner.com",
        },
        to: email,
        subject: `Confirme sua presença na viagem para ${trip.destination}`,
        html: `
      <div style="font-size: 16px; font-family: sans-serif; line-height: 1.6">
        <p>
          Você foi convidado para participar de uma viagem para <strong>${
            trip.destination
          }</strong>,
          nas datas de <strong>${dayjs(trip.starts_at).format("LL")}</strong> a
          <strong>${dayjs(trip.ends_at).format("LL")}</strong>
        </p>
        <p></p>
        <p>Para confirmar sua presença na viagem, clique no link abaixo:</p>
        <p></p>
        <p>
          <a href="http://localhost:3333/participants/${
            participant.id
          }/confirm">
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
        participantId: participant.id,
      };
    }
  );
}
