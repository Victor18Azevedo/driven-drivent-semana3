import { Hotel, Prisma, PrismaClient } from "@prisma/client";
import dayjs from "dayjs";

const prisma = new PrismaClient();

async function main() {
  await seedEvent();
  await seedTicketType();
  const hotels = await seedHotel();
  await seedRoom(hotels);
}

async function seedEvent() {
  let event = await prisma.event.findFirst();
  if (!event) {
    event = await prisma.event.create({
      data: {
        title: "Driven.t",
        logoImageUrl: "https://files.driveneducation.com.br/images/logo-rounded.png",
        backgroundImageUrl: "linear-gradient(to right, #FA4098, #FFD77F)",
        startsAt: dayjs().toDate(),
        endsAt: dayjs().add(21, "days").toDate(),
      },
    });
  }
  console.log({ event });
}

async function seedTicketType() {
  let ticketsTypes = await prisma.ticketType.findMany();
  if (ticketsTypes.length === 0) {
    await prisma.ticketType.createMany({
      data: [
        { name: "Presencial sem Hotel", price: 250, isRemote: false, includesHotel: false },
        { name: "Presencial com Hotel", price: 550, isRemote: false, includesHotel: true },
        { name: "Remoto", price: 220, isRemote: true, includesHotel: false },
      ],
    });
    ticketsTypes = await prisma.ticketType.findMany();
  }
  console.log({ ticketsTypes });
}

async function seedHotel(): Promise<Hotel[]> {
  let hotels = await prisma.hotel.findMany();
  if (hotels.length === 0) {
    await prisma.hotel.createMany({
      data: [
        {
          name: "Plaza Hotel",
          image:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0mL5gqDkFwnbR1HUV8TRQoKhVW8PHxqJLoi7gEKX-HPobhqywMsApMXBTTkCzF_l_-Kc&usqp=CAU",
        },
        {
          name: "Hilton Hotel",
          image:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTa6ORRXBL_czrlcdrfhLuudk9WWuZONejg_G2wf3NpaGPuYOjrvV4B_otZDCPXS4Lhe8&usqp=CAU",
        },
        {
          name: "Palace Hotel",
          image:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSn3EqGtnI-RoAdXMedoJPQWjuy921vafmbFGBU580Tvlp-u8N8xcpnmwD5f9v2q20dR1M&usqp=CAU",
        },
      ],
    });
    hotels = await prisma.hotel.findMany();
  }
  console.log({ hotels });
  return hotels;
}

async function seedRoom(hotels: Hotel[]) {
  let rooms: Prisma.RoomCreateManyInput[] = await prisma.room.findMany();
  if (rooms.length === 0) {
    hotels.forEach((hotel) => {
      rooms.push({ name: "102", capacity: 2, hotelId: hotel.id });
      rooms.push({ name: "303", capacity: 3, hotelId: hotel.id });
      rooms.push({ name: "404", capacity: 2, hotelId: hotel.id });
    });

    await prisma.room.createMany({
      data: rooms,
    });
    rooms = await prisma.room.findMany();
  }
  console.log({ rooms });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
