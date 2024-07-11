import { env } from "../env";
import { dayjs } from "../lib/dayJSFormatter";

export const createMessage = (
  destination: string,
  ends_at: Date,
  starts_at: Date,
  id: string
) => {
  const confirmUrl = `${env.API_BASE_URL}/participants/${id}/confirm`;
  return {
    message:
      `<div style="font-size: 16px; font-family: sans-serif; line-height: 1.6">
        <p>
          Você foi convidado para participar de uma viagem para <strong>${destination}</strong>,
          nas datas de <strong>${dayjs(starts_at).format("LL")}</strong> a
          <strong>${dayjs(ends_at).format("LL")}</strong>
        </p>
        <p></p>
        <p>Para confirmar sua presença na viagem, clique no link abaixo:</p>
        <p></p>
        <p>
          <a href="${confirmUrl}">
            Confirmar viagem
          </a>
        </p>
        <p></p>
        <p>
          Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail
        </p>
      </div>`.trim(),
    subject: `Confirme sua presença na viagem para ${destination}`,
  };
};
