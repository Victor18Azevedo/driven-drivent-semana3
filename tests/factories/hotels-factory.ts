import faker from "@faker-js/faker";
import { prisma } from "@/config";
import { Room } from "@prisma/client";

export async function createHotel() {
  return prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.imageUrl(),
    },
  });
}

export async function createRoom(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.random.numeric(2),
      capacity: faker.datatype.number({ min: 1, max: 4 }),
      hotelId,
    },
  });
}

export async function createHotelWithRooms(numberOfRooms: number) {
  const hotel = await createHotel();
  const rooms: Room[] = [];

  for (let i = 0; i < numberOfRooms; i++) {
    rooms.push(await createRoom(hotel.id));
  }

  return { ...hotel, Rooms: rooms };
}

export async function createManyHotels() {
  const hotels = [];
  const numberOfHotels = faker.datatype.number({ min: 10, max: 100 });

  for (let i = 0; i < numberOfHotels; i++) {
    hotels.push({
      name: faker.name.findName(),
      image: faker.image.imageUrl(),
    });
  }

  return prisma.hotel.createMany({ data: hotels });
}
