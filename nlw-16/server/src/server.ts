import cors from "@fastify/cors";
import fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { createActivity, getActivities } from "./routes/activities";
import { createLink, getLinks } from "./routes/links";
import {
  confirmParticipant,
  createInvite,
  getOneParticipant,
  getParticipants,
} from "./routes/participants";
import { confirmTrip, createTrip, getTrip, updateTrip } from "./routes/trip";

const app = fastify();

app.register(cors, { origin: "*" });

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrip);
app.register(confirmTrip);
app.register(updateTrip);
app.register(getTrip);

app.register(confirmParticipant);
app.register(getParticipants);
app.register(getOneParticipant);
app.register(createInvite);

app.register(createActivity);
app.register(getActivities);

app.register(createLink);
app.register(getLinks);

app.listen({ port: 3333 }).then(() => {
  console.log("Server running");
});
