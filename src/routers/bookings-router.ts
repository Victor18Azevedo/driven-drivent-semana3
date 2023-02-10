import { getBooking, postBooking, updateBooking } from "@/controllers";
import { authenticateToken, validateBody, validateParams } from "@/middlewares";
import { bookingBodySchema, paramsSchema } from "@/schemas";
import { Router } from "express";

const bookingsRouter = Router();

bookingsRouter
  .all("/*", authenticateToken)
  .get("/", getBooking)
  .post("/", validateBody(bookingBodySchema), postBooking)
  .put("/:bookingId", validateBody(bookingBodySchema), validateParams(paramsSchema), updateBooking);

export { bookingsRouter };
