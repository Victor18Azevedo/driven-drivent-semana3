import { forbiddenError, notFoundError } from "@/errors";
import bookingRepository, { CreateUpdateBooking } from "@/repositories/booking-repository";
import roomRepository from "@/repositories/room-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { Room } from "@prisma/client";

async function getUserBooking(userId: number): Promise<{ id: number; Room: Room }> {
  const userBooking = await bookingRepository.findBookingByUserId(userId);

  if (!userBooking) {
    throw notFoundError();
  }

  return userBooking;
}

async function createOrUpdateUserBooking(params: CreateUpdateBooking): Promise<{ bookingId: number }> {
  const { roomId, userId, bookingId } = params;

  const room = await roomRepository.findRoomById(roomId);
  // console.log(room);
  if (!room) {
    throw notFoundError();
  }

  const roomOccupation = await bookingRepository.countBookingRoomId(roomId);
  // console.log(roomOccupation);
  if (roomOccupation >= room.capacity) {
    throw forbiddenError();
  }

  const userTicket = await ticketRepository.findTicketByUserId(userId);
  if (!userTicket) {
    throw forbiddenError();
  }
  if (userTicket.TicketType.isRemote || !userTicket.TicketType.includesHotel || userTicket.status !== "PAID") {
    throw forbiddenError();
  }

  if (bookingId) {
    const userBooking = await bookingRepository.findBookingByUserIdAndBookingId({ userId, bookingId });
    if (!userBooking) {
      throw forbiddenError();
    }
  }

  const { id } = await bookingRepository.createOrUpdateBooking({ userId, roomId, bookingId: bookingId || 0 });

  return { bookingId: id };
}

const bookingService = {
  getUserBooking,
  createOrUpdateUserBooking,
};

export default bookingService;
