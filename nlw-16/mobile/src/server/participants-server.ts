import { api } from "./api";

export type Participant = {
  id: string;
  name: string;
  email: string;
  is_confirmed: boolean;
};

type ParticipantConfirm = {
  participantId: string;
  name: string;
  email: string;
};

async function getByTripId(tripId: string) {
  try {
    const { data } = await api.get<{ participants: Participant[] }>(
      `/trips/${tripId}/participants`
    );

    return data.participants;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function confirmTripByParticipantId({
  participantId,
  name,
  email,
}: ParticipantConfirm) {
  try {
    await api.patch(`/participants/${participantId}/confirm`, { name, email });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function getById(participantId: string) {
  try {
    const { data } = await api.get<{ participant: Participant }>(
      `/participants/${participantId}`
    );
    return data.participant;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export const participantsServer = { getByTripId, confirmTripByParticipantId, getById };