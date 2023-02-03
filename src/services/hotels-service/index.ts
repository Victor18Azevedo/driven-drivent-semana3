import { notFoundError, paymentRequiredError } from "@/errors";
import hotelRepository from "@/repositories/hotel-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function getHotels(userId: number) {
  const userTicket = await ticketRepository.findTicketByUserId(userId);

  if (!userTicket) {
    throw notFoundError();
  }

  const hotels = await hotelRepository.findHotels();

  if (!hotels.length) {
    throw notFoundError();
  }

  if (userTicket.status !== "PAID" || userTicket.TicketType.isRemote || !userTicket.TicketType.includesHotel) {
    throw paymentRequiredError();
  }
  return hotels;
}

async function getHotelById(id: number, userId: number) {
  const userTicket = await ticketRepository.findTicketByUserId(userId);

  if (!userTicket) {
    throw notFoundError();
  }

  if (userTicket.status !== "PAID" || userTicket.TicketType.isRemote || !userTicket.TicketType.includesHotel) {
    throw paymentRequiredError();
  }

  const hotel = await hotelRepository.findHotelById(id);

  if (!hotel) {
    throw notFoundError();
  }

  return hotel;
}

const hotelService = {
  getHotels,
  getHotelById,
};

export default hotelService;
