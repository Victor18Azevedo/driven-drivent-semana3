import { AuthenticatedRequest, handleApplicationErrors } from "@/middlewares";
import hotelService from "@/services/hotels-service";
import { Response } from "express";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const hotels = await hotelService.getHotels(userId);
    return res.send(hotels);
  } catch (error) {
    return handleApplicationErrors(error, req, res);
  }
}

export async function getHotelById(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { hotelId } = req.params;

  try {
    const hotel = await hotelService.getHotelById(parseInt(hotelId), userId);
    return res.send(hotel);
  } catch (error) {
    return handleApplicationErrors(error, req, res);
  }
}
