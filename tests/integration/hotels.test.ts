import app, { init } from "@/app";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createEnrollmentWithAddress,
  createUser,
  createTicketType,
  createTicket,
  createHotelWithRooms,
  createManyHotels,
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid and there isn`t hotel", () => {
    it("should respond with status 404 if there isn't enrollment nor ticket", async () => {
      const token = await generateValidToken();

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 if there is enrollment and theres isn't ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 if there is enrollment and remote reserved ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeRemote = await createTicketType("REMOTE");
      await createTicket(enrollment.id, ticketTypeRemote.id, "RESERVED");

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 if there is enrollment and remote paid ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeRemote = await createTicketType("REMOTE");
      await createTicket(enrollment.id, ticketTypeRemote.id, "PAID");

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 if there is enrollment and includes hotel reserved ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeIncludesHotel = await createTicketType("INCLUDE_HOTEL");
      await createTicket(enrollment.id, ticketTypeIncludesHotel.id, "RESERVED");

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 if there is enrollment and includes hotel paid ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeIncludesHotel = await createTicketType("INCLUDE_HOTEL");
      await createTicket(enrollment.id, ticketTypeIncludesHotel.id, "PAID");

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 if there is enrollment and local reserved ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeLocal = await createTicketType("LOCAL");
      await createTicket(enrollment.id, ticketTypeLocal.id, "RESERVED");

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 if there is enrollment and local paid ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeLocal = await createTicketType("LOCAL");
      await createTicket(enrollment.id, ticketTypeLocal.id, "PAID");

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
  });

  describe("when token is valid and there is hotel", () => {
    it("should respond with status 404 if there isn't enrollment nor ticket", async () => {
      await createHotelWithRooms(2);
      const token = await generateValidToken();

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 if there is enrollment and theres isn't ticket", async () => {
      await createHotelWithRooms(2);
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 402 if there is enrollment and remote reserved ticket", async () => {
      await createHotelWithRooms(2);
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeRemote = await createTicketType("REMOTE");
      await createTicket(enrollment.id, ticketTypeRemote.id, "RESERVED");

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 402 if there is enrollment and remote paid ticket", async () => {
      await createHotelWithRooms(2);
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeRemote = await createTicketType("REMOTE");
      await createTicket(enrollment.id, ticketTypeRemote.id, "PAID");

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 402 if there is enrollment and includes hotel reserved ticket", async () => {
      await createHotelWithRooms(2);
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeIncludesHotel = await createTicketType("INCLUDE_HOTEL");
      await createTicket(enrollment.id, ticketTypeIncludesHotel.id, "RESERVED");

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 402 if there is enrollment and local reserved ticket", async () => {
      await createHotelWithRooms(2);
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeLocal = await createTicketType("LOCAL");
      await createTicket(enrollment.id, ticketTypeLocal.id, "RESERVED");

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 402 if there is enrollment and local paid ticket", async () => {
      await createHotelWithRooms(2);
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeLocal = await createTicketType("LOCAL");
      await createTicket(enrollment.id, ticketTypeLocal.id, "PAID");

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 200 if there is enrollment and includes hotel paid ticket", async () => {
      const hotel = await createHotelWithRooms(2);
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeIncludesHotel = await createTicketType("INCLUDE_HOTEL");
      await createTicket(enrollment.id, ticketTypeIncludesHotel.id, "PAID");

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual([
        expect.objectContaining({
          id: hotel.id,
          name: hotel.name,
          image: hotel.image,
          createdAt: hotel.createdAt.toISOString(),
          updatedAt: hotel.updatedAt.toISOString(),
        }),
      ]);
    });

    it("should respond with status 200 if there is enrollment and includes hotel paid ticket", async () => {
      const hotel1 = await createHotelWithRooms(2);
      const hotel2 = await createHotelWithRooms(2);
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeIncludesHotel = await createTicketType("INCLUDE_HOTEL");
      await createTicket(enrollment.id, ticketTypeIncludesHotel.id, "PAID");

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual([
        {
          id: hotel1.id,
          name: hotel1.name,
          image: hotel1.image,
          createdAt: hotel1.createdAt.toISOString(),
          updatedAt: hotel1.updatedAt.toISOString(),
        },
        {
          id: hotel2.id,
          name: hotel2.name,
          image: hotel2.image,
          createdAt: hotel2.createdAt.toISOString(),
          updatedAt: hotel2.updatedAt.toISOString(),
        },
      ]);
    });

    it("should respond with status 200 if there is enrollment and includes hotel paid ticket and all hotels", async () => {
      const { count } = await createManyHotels();
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeIncludesHotel = await createTicketType("INCLUDE_HOTEL");
      await createTicket(enrollment.id, ticketTypeIncludesHotel.id, "PAID");

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toHaveLength(count);
    });
  });
});

describe("GET /hotels/:hotelId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const hotel = await createHotelWithRooms(2);

    const response = await server.get(`/hotels/${hotel.id}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const hotel = await createHotelWithRooms(2);
    const token = faker.lorem.word();

    const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const hotel = await createHotelWithRooms(2);
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid and there isn`t hotel", () => {
    it("should respond with status 404 if there isn't enrollment nor ticket", async () => {
      const fakerHotelId = faker.datatype.number({ min: 1 });
      const token = await generateValidToken();

      const response = await server.get(`/hotels/${fakerHotelId}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 if there is enrollment and theres isn't ticket", async () => {
      const fakerHotelId = faker.datatype.number({ min: 1 });
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.get(`/hotels/${fakerHotelId}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 if there is enrollment and remote reserved ticket", async () => {
      const fakerHotelId = faker.datatype.number({ min: 1 });
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeRemote = await createTicketType("REMOTE");
      await createTicket(enrollment.id, ticketTypeRemote.id, "RESERVED");

      const response = await server.get(`/hotels/${fakerHotelId}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 if there is enrollment and remote paid ticket", async () => {
      const fakerHotelId = faker.datatype.number({ min: 1 });
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeRemote = await createTicketType("REMOTE");
      await createTicket(enrollment.id, ticketTypeRemote.id, "PAID");

      const response = await server.get(`/hotels/${fakerHotelId}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 if there is enrollment and includes hotel reserved ticket", async () => {
      const fakerHotelId = faker.datatype.number({ min: 1 });
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeIncludesHotel = await createTicketType("INCLUDE_HOTEL");
      await createTicket(enrollment.id, ticketTypeIncludesHotel.id, "RESERVED");

      const response = await server.get(`/hotels/${fakerHotelId}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 if there is enrollment and includes hotel paid ticket", async () => {
      const fakerHotelId = faker.datatype.number({ min: 1 });
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeIncludesHotel = await createTicketType("INCLUDE_HOTEL");
      await createTicket(enrollment.id, ticketTypeIncludesHotel.id, "PAID");

      const response = await server.get(`/hotels/${fakerHotelId}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 if there is enrollment and local reserved ticket", async () => {
      const fakerHotelId = faker.datatype.number({ min: 1 });
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeLocal = await createTicketType("LOCAL");
      await createTicket(enrollment.id, ticketTypeLocal.id, "RESERVED");

      const response = await server.get(`/hotels/${fakerHotelId}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 if there is enrollment and local paid ticket", async () => {
      const fakerHotelId = faker.datatype.number({ min: 1 });
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeLocal = await createTicketType("LOCAL");
      await createTicket(enrollment.id, ticketTypeLocal.id, "PAID");

      const response = await server.get(`/hotels/${fakerHotelId}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
  });

  describe("when token is valid and there is hotel", () => {
    it("should respond with status 404 if there isn't enrollment nor ticket", async () => {
      const hotel = await createHotelWithRooms(2);
      const token = await generateValidToken();

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 if there is enrollment and theres isn't ticket", async () => {
      const hotel = await createHotelWithRooms(2);
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 402 if there is enrollment and remote reserved ticket", async () => {
      const hotel = await createHotelWithRooms(2);
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeRemote = await createTicketType("REMOTE");
      await createTicket(enrollment.id, ticketTypeRemote.id, "RESERVED");

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 402 if there is enrollment and remote paid ticket", async () => {
      const hotel = await createHotelWithRooms(2);
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeRemote = await createTicketType("REMOTE");
      await createTicket(enrollment.id, ticketTypeRemote.id, "PAID");

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 402 if there is enrollment and includes hotel reserved ticket", async () => {
      const hotel = await createHotelWithRooms(2);
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeIncludesHotel = await createTicketType("INCLUDE_HOTEL");
      await createTicket(enrollment.id, ticketTypeIncludesHotel.id, "RESERVED");

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 402 if there is enrollment and local reserved ticket", async () => {
      const hotel = await createHotelWithRooms(2);
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeLocal = await createTicketType("LOCAL");
      await createTicket(enrollment.id, ticketTypeLocal.id, "RESERVED");

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 402 if there is enrollment and local paid ticket", async () => {
      const hotel = await createHotelWithRooms(2);
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeLocal = await createTicketType("LOCAL");
      await createTicket(enrollment.id, ticketTypeLocal.id, "PAID");

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 200 if there is enrollment and includes hotel paid ticket", async () => {
      const hotel = await createHotelWithRooms(2);
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeIncludesHotel = await createTicketType("INCLUDE_HOTEL");
      await createTicket(enrollment.id, ticketTypeIncludesHotel.id, "PAID");

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        id: hotel.id,
        name: hotel.name,
        image: hotel.image,
        createdAt: hotel.createdAt.toISOString(),
        updatedAt: hotel.updatedAt.toISOString(),
        Rooms: [
          {
            id: hotel.Rooms[0].id,
            name: hotel.Rooms[0].name,
            capacity: hotel.Rooms[0].capacity,
            hotelId: hotel.Rooms[0].hotelId,
            createdAt: hotel.Rooms[0].createdAt.toISOString(),
            updatedAt: hotel.Rooms[0].updatedAt.toISOString(),
          },
          {
            id: hotel.Rooms[1].id,
            name: hotel.Rooms[1].name,
            capacity: hotel.Rooms[1].capacity,
            hotelId: hotel.Rooms[1].hotelId,
            createdAt: hotel.Rooms[1].createdAt.toISOString(),
            updatedAt: hotel.Rooms[1].updatedAt.toISOString(),
          },
        ],
      });
    });

    it("should respond with status 200 if return correct hotel", async () => {
      await createHotelWithRooms(2);
      const hotel = await createHotelWithRooms(3);
      await createHotelWithRooms(2);

      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeIncludesHotel = await createTicketType("INCLUDE_HOTEL");
      await createTicket(enrollment.id, ticketTypeIncludesHotel.id, "PAID");

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        id: hotel.id,
        name: hotel.name,
        image: hotel.image,
        createdAt: hotel.createdAt.toISOString(),
        updatedAt: hotel.updatedAt.toISOString(),
        Rooms: [
          {
            id: hotel.Rooms[0].id,
            name: hotel.Rooms[0].name,
            capacity: hotel.Rooms[0].capacity,
            hotelId: hotel.Rooms[0].hotelId,
            createdAt: hotel.Rooms[0].createdAt.toISOString(),
            updatedAt: hotel.Rooms[0].updatedAt.toISOString(),
          },
          {
            id: hotel.Rooms[1].id,
            name: hotel.Rooms[1].name,
            capacity: hotel.Rooms[1].capacity,
            hotelId: hotel.Rooms[1].hotelId,
            createdAt: hotel.Rooms[1].createdAt.toISOString(),
            updatedAt: hotel.Rooms[1].updatedAt.toISOString(),
          },
          {
            id: hotel.Rooms[2].id,
            name: hotel.Rooms[2].name,
            capacity: hotel.Rooms[2].capacity,
            hotelId: hotel.Rooms[2].hotelId,
            createdAt: hotel.Rooms[2].createdAt.toISOString(),
            updatedAt: hotel.Rooms[2].updatedAt.toISOString(),
          },
        ],
      });
    });

    it("body must contain 'image' field ", async () => {
      const hotel = await createHotelWithRooms(2);
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeIncludesHotel = await createTicketType("INCLUDE_HOTEL");
      await createTicket(enrollment.id, ticketTypeIncludesHotel.id, "PAID");

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      delete response.body.image;

      expect(response.body).not.toEqual({
        id: hotel.id,
        name: hotel.name,
        image: hotel.image,
        createdAt: hotel.createdAt.toISOString(),
        updatedAt: hotel.updatedAt.toISOString(),
        Rooms: [
          {
            id: hotel.Rooms[0].id,
            name: hotel.Rooms[0].name,
            capacity: hotel.Rooms[0].capacity,
            hotelId: hotel.Rooms[0].hotelId,
            createdAt: hotel.Rooms[0].createdAt.toISOString(),
            updatedAt: hotel.Rooms[0].updatedAt.toISOString(),
          },
          {
            id: hotel.Rooms[1].id,
            name: hotel.Rooms[1].name,
            capacity: hotel.Rooms[1].capacity,
            hotelId: hotel.Rooms[1].hotelId,
            createdAt: hotel.Rooms[1].createdAt.toISOString(),
            updatedAt: hotel.Rooms[1].updatedAt.toISOString(),
          },
        ],
      });
    });

    it("body must contain 'Rooms' field ", async () => {
      const hotel = await createHotelWithRooms(2);
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeIncludesHotel = await createTicketType("INCLUDE_HOTEL");
      await createTicket(enrollment.id, ticketTypeIncludesHotel.id, "PAID");

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      delete response.body.Rooms;

      expect(response.body).not.toEqual({
        id: hotel.id,
        name: hotel.name,
        image: hotel.image,
        createdAt: hotel.createdAt.toISOString(),
        updatedAt: hotel.updatedAt.toISOString(),
        Rooms: [
          {
            id: hotel.Rooms[0].id,
            name: hotel.Rooms[0].name,
            capacity: hotel.Rooms[0].capacity,
            hotelId: hotel.Rooms[0].hotelId,
            createdAt: hotel.Rooms[0].createdAt.toISOString(),
            updatedAt: hotel.Rooms[0].updatedAt.toISOString(),
          },
          {
            id: hotel.Rooms[1].id,
            name: hotel.Rooms[1].name,
            capacity: hotel.Rooms[1].capacity,
            hotelId: hotel.Rooms[1].hotelId,
            createdAt: hotel.Rooms[1].createdAt.toISOString(),
            updatedAt: hotel.Rooms[1].updatedAt.toISOString(),
          },
        ],
      });
    });
  });
});
