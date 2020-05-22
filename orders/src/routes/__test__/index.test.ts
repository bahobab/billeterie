import request from "supertest";
import mongoose from "mongoose";

import { Order, OrderStatus } from "../../models/order";
import { Ticket } from "../../models/ticket";
import { app } from "../../app";

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "fela",
    price: 98,
  });

  await ticket.save();

  return ticket;
};

it("fetches orders created by a particular user", async () => {
  // create three tickets

  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();

  const userOne = global.signin();
  const userTwo = global.signin();

  // create one order as user #1
  const respOne = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticketOne.id });

  const orderOne = respOne.body;

  expect(respOne.status).toEqual(201);

  // create 2 orders as user #2
  const respTwo = await request(app)
    .post("/api/orders")
    .set("Cookie", userTwo)
    .send({ ticketId: ticketTwo.id });

  expect(respTwo.status).toEqual(201);

  const respThree = await request(app)
    .post("/api/orders")
    .set("Cookie", userTwo)
    .send({ ticketId: ticketThree.id });

  expect(respThree.status).toEqual(201);

  // make request to fetch orders by user #2
  const resOrderpU2 = await request(app)
    .get("/api/orders")
    .set("Cookie", userTwo)
    .expect(200);

  //   expect(resOrderpU2.status).toEqual(200);

  // make sure only orders created by user #2 are returned
  expect(resOrderpU2.body.length).toEqual(2);
  // write specific tests on order attributes
});
