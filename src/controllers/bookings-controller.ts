import { AuthenticatedRequest, handleApplicationErrors } from "@/middlewares";
import { BookingBody } from "@/schemas/booking-schema";
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

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body as BookingBody;

  try {
    const booking = await bookingService.createOrUpdateUserBooking({ userId, roomId });
    return res.send(booking);
  } catch (error) {
    return handleApplicationErrors(error, req, res);
  }
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const { bookingId } = req.params;
  const { userId } = req;
  const { roomId } = req.body as BookingBody;

  try {
    const booking = await bookingService.createOrUpdateUserBooking({ userId, roomId, bookingId: parseInt(bookingId) });
    return res.send(booking);
  } catch (error) {
    return handleApplicationErrors(error, req, res);
  }
}
