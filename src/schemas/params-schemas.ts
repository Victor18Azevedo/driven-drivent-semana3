import Joi from "joi";

export const paramsSchema = Joi.object<ParamsSchema>({
  hotelId: Joi.number().greater(0).optional(),
  bookingId: Joi.number().greater(0).optional(),
});

export type ParamsSchema = { hotelId?: number; bookingId?: number };
