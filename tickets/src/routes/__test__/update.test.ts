import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

const createTicketId = () => {
  return new mongoose.Types.ObjectId().toHexString();
};

const createdTicketResp = async (title: string, price: number) => {
  return await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title, price });
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
  // const ticketId = createTicketId();
  const resCreated = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title: "fyghkj", price: 98 });

  const response = await request(app)
    .put(`/api/tickets/${resCreated.body.id}`)
    .send({ title: "djdjdj", price: 65 })
    .expect(401);
});

it("returns a 401 if the user does not own the ticket", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title: "dkjfdjfg", price: 33 });

  const ticket = await Ticket.findById(response.body.id);

  const res = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", global.signin())
    .send({ title: "oooooooooo", price: 90 })
    .expect(401);
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
    .expect(201);

  expect(updatedResponse.body.title).toEqual("yoyoyo");
  expect(updatedResponse.body.price).toEqual(9999);
});

it("publishes an event after a ticket is updated", async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "dkjfdjfg", price: 33 });

  const updatedResponse = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "yoyoyo", price: 9999 })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("rejects update if ticket is reserved", async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "dkjfdjfg", price: 33 });

  const ticket = await Ticket.findById(response.body.id);
  ticket?.set({ orderId: mongoose.Types.ObjectId().toHexString() });
  await ticket?.save();

  const updatedResponse = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "yoyoyo", price: 9999 })
    .expect(400);
});
