import { api } from "./api";

export type TripDetails = {
  id: string;
  destination: string;
  starts_at: string;
  ends_at: string;
  is_confirmed: boolean;
};

type TripCreate = Omit<TripDetails, "id" | "is_confirmed"> & {
  emails_to_invite: string[];
};

async function getById(id: string) {
  try {
    const { data } = await api.get<{ trip: TripDetails }>(`/trips/${id}`);
    return data.trip;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

async function create({
  destination,
  ends_at,
  starts_at,
  emails_to_invite,
}: TripCreate) {
  try {
    const { data } = await api.post<{ tripId: string }>("/trips", {
      destination,
      starts_at,
      ends_at,
      emails_to_invite,
      owner_name: "Débora Serra",
      owner_email: "debora.r.serra@gmail.com",
    });
    return data;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export const tripServer = { getById, create };
