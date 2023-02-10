import { Booking } from "@prisma/client";
import Joi from "joi";

export const bookingBodySchema = Joi.object<BookingBody>({
  roomId: Joi.number().greater(0).required(),
});

export type BookingBody = Pick<Booking, "roomId">;
