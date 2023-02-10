import { notFoundError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";

async function getUserBooking(userId: number) {
  const userBooking = await bookingRepository.findBookingByUserId(userId);

  if (!userBooking) {
    throw notFoundError();
  }

  return userBooking;
}
const bookingService = {
  getUserBooking,
};

export default bookingService;
