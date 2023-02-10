import { prisma } from "@/config";

async function findBookingByUserId(userId: number) {
  return prisma.booking.findFirst({ where: { userId }, select: { id: true, Room: true } });
}

async function findBookingByUserIdAndBookingId(params: FindByUserIdBookingId) {
  const { userId, bookingId } = params;

  return prisma.booking.findFirst({ where: { AND: [{ id: bookingId }, { userId }] } });
}

async function countBookingRoomId(roomId: number) {
  return prisma.booking.count({ where: { roomId } });
}

async function createOrUpdateBooking(params: CreateUpdateBooking) {
  const { roomId, userId, bookingId } = params;

  return prisma.booking.upsert({
    where: { id: bookingId },
    create: { userId, roomId },
    update: { userId, roomId },
  });
}

const bookingRepository = {
  findBookingByUserId,
  countBookingRoomId,
  createOrUpdateBooking,
  findBookingByUserIdAndBookingId,
};

export default bookingRepository;

export type CreateUpdateBooking = { userId: number; roomId: number; bookingId?: number };
type FindByUserIdBookingId = { userId: number; bookingId: number };
