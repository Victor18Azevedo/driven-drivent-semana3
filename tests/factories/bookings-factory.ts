import { prisma } from "@/config";
import { Room } from "@prisma/client";
import { createHotelWithRooms } from "./hotels-factory";

export async function createBooking(params: { userId: number; roomId?: number }) {
  const { userId, roomId } = params;
  if (!roomId) {
    const hotelWithRooms = await createHotelWithRooms(1);
    params.roomId = hotelWithRooms.Rooms[0].id;
  }

  return prisma.booking.create({
    data: {
      userId,
      roomId: params.roomId,
    },
    include: { Room: true },
  });
}

export async function fillTheRoom(params: { userId: number; room: Room }) {
  const { userId, room } = params;
  const roomId = room.id;
  for (let i = 0; i < room.capacity; i++) await createBooking({ userId, roomId });
}
