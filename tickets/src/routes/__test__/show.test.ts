import request from "supertest";
import mongoose from "mongoose";

import { Ticket } from "../../models/ticket";

import { app } from "../../app";

it("returns a 404 if ticket is not found", async () => {
  let ticketId = mongoose.Types.ObjectId().toHexString();
  //   const existingTicket = await Ticket.findById({ _id: ticketId });

  const response = await request(app)
    .get(`/api/tickets/${ticketId}`)
    .send()
    .expect(404);
});

it("returns a 200 if the ticket is found", async () => {
  const ticket = {
    title: "fkfkfk",
    price: 30,
  };

  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send(ticket)
    .expect(201);

  const response = await request(app)
    .get(`/api/tickets/${res.body.id}`)
    .send()
    .expect(200);

  expect(response.body.title).toEqual(ticket.title);
  expect(response.body.price).toEqual(ticket.price);
});
