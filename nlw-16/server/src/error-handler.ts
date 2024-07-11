import { FastifyInstance } from "fastify";
import { ClientError } from "./errors/client-error";
import { ZodError } from "zod";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifyErrorHandler = async (error, req, res) => {
  if (error instanceof ZodError) {
    res.status(400).send({
      message: "Invalid input",
      errors: error.flatten().fieldErrors,
    })
  }
  if (error instanceof ClientError) {
    res.status(400).send(error.message);
  }
  res.status(500).send({ message: "Internal Server Error" });
};
