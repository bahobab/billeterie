import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { Ticket } from "../../models/ticket";

const createTicketId = () => {
  return new mongoose.Types.ObjectId().toHexString();
};

const createTicket = (title: string, price: number) => {
  return request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title, price })
    .expect(201);
};

it("returns a 404 if the provided id does not exist", async () => {
  const ticketId = createTicketId();

  await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set("Cookie", global.signin())
    .send({ title: "fghjgg", price: 21 })
    .expect(404);
});

it("returns a 401 if the user is not authenticated", async () => {
  const ticketId = createTicketId();
  const response = await request(app)
    .put(`/api/tickets/${ticketId}`)
    .send({ title: "djdjdj", price: 65 })
    .expect(401);
});

it("returns a 401 if the user does not own the ticket", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title: "dkjfdjfg", price: 33 });

  console.log("ticket id", response.body.id);

  const ticket = await Ticket.findById(response.body.id);
  console.log("ticket fetched", ticket);

  const res = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", global.signin())
    .send({ title: "oooooooooo", price: 90 });
  // .expect(401);

  console.log(res.body);
  expect(res.body.status).toEqual(401);

  //   console.log(res.body);
  //   expect(res.body).toEqual({});
});

it("returns a 400 if the ticket does not exist", async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "dkjfdjfg", price: 33 });

  await request(app)
    .put(`/api/tickets/:${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "" })
    .expect(400);

  await request(app)
    .put(`/api/tickets/:${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "ssssssssss", price: -88 })
    .expect(400);
});

it("returns a 202 update the ticket if valid user and ticket id", async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "dkjfdjfg", price: 33 });

  const updatedResponse = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "yoyoyo", price: 9999 })
    .expect(200);

  expect(updatedResponse.body.title).toEqual("yoyoyo");
  expect(updatedResponse.body.price).toEqual(9999);
});
