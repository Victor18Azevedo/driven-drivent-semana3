import faker from "@faker-js/faker";
import { prisma } from "@/config";
import { TicketStatus } from "@prisma/client";

export async function createTicketType(type?: TicketTypeString) {
  const ticketTypeMap: TicketTypeMap = {
    REMOTE: { isRemote: true, includesHotel: false },
    INCLUDE_HOTEL: { isRemote: false, includesHotel: true },
    LOCAL: { isRemote: false, includesHotel: false },
  };
  return prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote: type ? ticketTypeMap[type].isRemote : faker.datatype.boolean(),
      includesHotel: type ? ticketTypeMap[type].includesHotel : faker.datatype.boolean(),
    },
  });
}

export async function createTicketTypeRemote() {
  return prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote: true,
      includesHotel: faker.datatype.boolean(),
    },
  });
}

export async function createTicketTypeWithHotel() {
  return prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote: false,
      includesHotel: true,
    },
  });
}

export async function createTicket(enrollmentId: number, ticketTypeId: number, status: TicketStatus) {
  return prisma.ticket.create({
    data: {
      enrollmentId,
      ticketTypeId,
      status,
    },
  });
}

type TicketTypeMap = {
  REMOTE: { isRemote: boolean; includesHotel: boolean };
  INCLUDE_HOTEL: { isRemote: boolean; includesHotel: boolean };
  LOCAL: { isRemote: boolean; includesHotel: boolean };
};

type TicketTypeString = "REMOTE" | "LOCAL" | "INCLUDE_HOTEL";
