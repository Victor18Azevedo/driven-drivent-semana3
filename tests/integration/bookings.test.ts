import app, { init } from "@/app";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createBooking,
  createEnrollmentWithAddress,
  createHotelWithRooms,
  createTicket,
  createTicketType,
  createUser,
  fillTheRoom,
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    createUser;
    const response = await server.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 when there is no booking for given user", async () => {
      const token = await generateValidToken();

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and booking id with room data when there is a booking for given user", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const booking = await createBooking({ userId: user.id });

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        id: booking.id,
        Room: {
          ...booking.Room,
          createdAt: booking.Room.createdAt.toISOString(),
          updatedAt: booking.Room.updatedAt.toISOString(),
        },
      });
    });
  });
});

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 400 when receive invalid schema", async () => {
      const token = await generateValidToken();

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({});

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 400 when receive roomId as string", async () => {
      const token = await generateValidToken();

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({
        roomId: faker.datatype.string(),
      });

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 404 when don't found room", async () => {
      const token = await generateValidToken();

      const response = await server
        .post("/booking")
        .set("Authorization", `Bearer ${token}`)
        .send({
          roomId: faker.datatype.number({ min: 0 }),
        });

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 when user don't have ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);
      const hotelWithRooms = await createHotelWithRooms(1);
      const roomId = hotelWithRooms.Rooms[0].id;

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({
        roomId,
      });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when user's ticket is paid and remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrolment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType("REMOTE");
      await createTicket(enrolment.id, ticketType.id, "PAID");
      const hotelWithRooms = await createHotelWithRooms(1);
      const roomId = hotelWithRooms.Rooms[0].id;

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({
        roomId,
      });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when user's ticket is paid and not include hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrolment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType("LOCAL");
      await createTicket(enrolment.id, ticketType.id, "PAID");
      const hotelWithRooms = await createHotelWithRooms(1);
      const roomId = hotelWithRooms.Rooms[0].id;

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({
        roomId,
      });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when user's ticket is reserved and remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrolment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType("REMOTE");
      await createTicket(enrolment.id, ticketType.id, "RESERVED");
      const hotelWithRooms = await createHotelWithRooms(1);
      const roomId = hotelWithRooms.Rooms[0].id;

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({
        roomId,
      });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when user's ticket is reserved and not include hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrolment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType("LOCAL");
      await createTicket(enrolment.id, ticketType.id, "RESERVED");
      const hotelWithRooms = await createHotelWithRooms(1);
      const roomId = hotelWithRooms.Rooms[0].id;

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({
        roomId,
      });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when user's ticket is reserved and includes hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrolment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType("INCLUDE_HOTEL");
      await createTicket(enrolment.id, ticketType.id, "RESERVED");
      const hotelWithRooms = await createHotelWithRooms(1);
      const roomId = hotelWithRooms.Rooms[0].id;

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({
        roomId,
      });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 200 and bookingId when user's ticket is paid and includes hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrolment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType("INCLUDE_HOTEL");
      await createTicket(enrolment.id, ticketType.id, "PAID");
      const hotelWithRooms = await createHotelWithRooms(1);
      const roomId = hotelWithRooms.Rooms[0].id;

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({
        roomId,
      });

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        bookingId: expect.any(Number),
      });
    });

    it("should respond with status 403 when the room is fully occupied", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrolment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType("INCLUDE_HOTEL");
      await createTicket(enrolment.id, ticketType.id, "PAID");
      const hotelWithRooms = await createHotelWithRooms(1);
      const room = hotelWithRooms.Rooms[0];
      const roomId = room.id;
      await fillTheRoom({ userId: user.id, room });

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({
        roomId,
      });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });
  });
});

describe("PUT /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const user = await createUser();
    const { id } = await createBooking({ userId: user.id });
    const response = await server.put(`/booking/${id}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const user = await createUser();
    const { id } = await createBooking({ userId: user.id });
    const token = faker.lorem.word();

    const response = await server.put(`/booking/${id}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const { id } = await createBooking({ userId: userWithoutSession.id });
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put(`/booking/${id}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 400 when receive invalid schema", async () => {
      const user = await createUser();
      const { id } = await createBooking({ userId: user.id });
      const token = await generateValidToken(user);

      const response = await server.put(`/booking/${id}`).set("Authorization", `Bearer ${token}`).send({});

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 400 when receive roomId as string", async () => {
      const user = await createUser();
      const { id } = await createBooking({ userId: user.id });
      const token = await generateValidToken(user);

      const response = await server.put(`/booking/${id}`).set("Authorization", `Bearer ${token}`).send({
        roomId: faker.datatype.string(),
      });

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 404 when don't found room", async () => {
      const user = await createUser();
      const { id } = await createBooking({ userId: user.id });
      const token = await generateValidToken(user);

      const response = await server
        .put(`/booking/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          roomId: faker.datatype.number({ min: 0 }),
        });

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 when user don't have ticket", async () => {
      const user = await createUser();
      const { id } = await createBooking({ userId: user.id });
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);
      const hotelWithRooms = await createHotelWithRooms(1);
      const roomId = hotelWithRooms.Rooms[0].id;

      const response = await server.put(`/booking/${id}`).set("Authorization", `Bearer ${token}`).send({
        roomId,
      });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when user's ticket is paid and remote", async () => {
      const user = await createUser();
      const { id } = await createBooking({ userId: user.id });
      const token = await generateValidToken(user);
      const enrolment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType("REMOTE");
      await createTicket(enrolment.id, ticketType.id, "PAID");
      const hotelWithRooms = await createHotelWithRooms(1);
      const roomId = hotelWithRooms.Rooms[0].id;

      const response = await server.put(`/booking/${id}`).set("Authorization", `Bearer ${token}`).send({
        roomId,
      });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when user's ticket is paid and not include hotel", async () => {
      const user = await createUser();
      const { id } = await createBooking({ userId: user.id });
      const token = await generateValidToken(user);
      const enrolment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType("LOCAL");
      await createTicket(enrolment.id, ticketType.id, "PAID");
      const hotelWithRooms = await createHotelWithRooms(1);
      const roomId = hotelWithRooms.Rooms[0].id;

      const response = await server.put(`/booking/${id}`).set("Authorization", `Bearer ${token}`).send({
        roomId,
      });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when user's ticket is reserved and remote", async () => {
      const user = await createUser();
      const { id } = await createBooking({ userId: user.id });
      const token = await generateValidToken(user);
      const enrolment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType("REMOTE");
      await createTicket(enrolment.id, ticketType.id, "RESERVED");
      const hotelWithRooms = await createHotelWithRooms(1);
      const roomId = hotelWithRooms.Rooms[0].id;

      const response = await server.put(`/booking/${id}`).set("Authorization", `Bearer ${token}`).send({
        roomId,
      });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when user's ticket is reserved and not include hotel", async () => {
      const user = await createUser();
      const { id } = await createBooking({ userId: user.id });
      const token = await generateValidToken(user);
      const enrolment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType("LOCAL");
      await createTicket(enrolment.id, ticketType.id, "RESERVED");
      const hotelWithRooms = await createHotelWithRooms(1);
      const roomId = hotelWithRooms.Rooms[0].id;

      const response = await server.put(`/booking/${id}`).set("Authorization", `Bearer ${token}`).send({
        roomId,
      });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when user's ticket is reserved and includes hotel", async () => {
      const user = await createUser();
      const { id } = await createBooking({ userId: user.id });
      const token = await generateValidToken(user);
      const enrolment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType("INCLUDE_HOTEL");
      await createTicket(enrolment.id, ticketType.id, "RESERVED");
      const hotelWithRooms = await createHotelWithRooms(1);
      const roomId = hotelWithRooms.Rooms[0].id;

      const response = await server.put(`/booking/${id}`).set("Authorization", `Bearer ${token}`).send({
        roomId,
      });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 200 and bookingId when user's ticket is paid and includes hotel", async () => {
      const user = await createUser();
      const { id } = await createBooking({ userId: user.id });
      const token = await generateValidToken(user);
      const enrolment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType("INCLUDE_HOTEL");
      await createTicket(enrolment.id, ticketType.id, "PAID");
      const hotelWithRooms = await createHotelWithRooms(1);
      const roomId = hotelWithRooms.Rooms[0].id;

      const response = await server.put(`/booking/${id}`).set("Authorization", `Bearer ${token}`).send({
        roomId,
      });

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        bookingId: expect.any(Number),
      });
    });

    it("should respond with status 403 when the room is fully occupied", async () => {
      const user = await createUser();
      const { id } = await createBooking({ userId: user.id });
      const token = await generateValidToken(user);
      const enrolment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType("INCLUDE_HOTEL");
      await createTicket(enrolment.id, ticketType.id, "PAID");
      const hotelWithRooms = await createHotelWithRooms(1);
      const room = hotelWithRooms.Rooms[0];
      const roomId = room.id;
      await fillTheRoom({ userId: user.id, room });

      const response = await server.put(`/booking/${id}`).set("Authorization", `Bearer ${token}`).send({
        roomId,
      });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when user is not booking owner", async () => {
      const user = await createUser();
      const { id } = await createBooking({ userId: user.id });
      const enrolment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType("INCLUDE_HOTEL");
      await createTicket(enrolment.id, ticketType.id, "PAID");
      const hotelWithRooms = await createHotelWithRooms(1);
      const roomId = hotelWithRooms.Rooms[0].id;

      const anotherUser = await createUser();
      const anotherToken = await generateValidToken(anotherUser);
      const anotherEnrolment = await createEnrollmentWithAddress(anotherUser);
      await createTicket(anotherEnrolment.id, ticketType.id, "PAID");

      const response = await server.put(`/booking/${id}`).set("Authorization", `Bearer ${anotherToken}`).send({
        roomId,
      });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });
  });
});
