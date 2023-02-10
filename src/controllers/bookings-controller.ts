import { AuthenticatedRequest, handleApplicationErrors } from "@/middlewares";
import bookingService from "@/services/bookings-service";
import { Response } from "express";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const booking = await bookingService.getUserBooking(userId);
    return res.send(booking);
  } catch (error) {
    return handleApplicationErrors(error, req, res);
  }
}
