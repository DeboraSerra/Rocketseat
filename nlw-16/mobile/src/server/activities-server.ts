import { api } from "./api";

type Activity = {
  id: string;
  occurs_at: string;
  title: string;
};

type ActivityCreate = Omit<Activity, "id"> & {
  tripId: string;
};

export type ActivityResponse = {
  date: string;
  activities: Activity[];
};

async function create({ tripId, occurs_at, title }: ActivityCreate) {
  try {
    const { data } = await api.post<{ activityId: string }>(
      `/trips/${tripId}/activities`,
      { occurs_at, title }
    );

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function getActivitiesByTripId(tripId: string) {
  try {
    const { data } = await api.get<{ activities: ActivityResponse[] }>(
      `/trips/${tripId}/activities`
    );
    return data.activities;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const activitiesServer = { create, getActivitiesByTripId };
