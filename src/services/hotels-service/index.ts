import { notFoundError } from "@/errors";
import hotelRepository from "@/repositories/hotel-repository";

async function getHotels() {
  const hotels = await hotelRepository.findHotels();

  if (!hotels) {
    throw notFoundError();
  }
  return hotels;
}

async function getHotelById(id: number) {
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
