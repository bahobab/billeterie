import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";

it("returns a 404 if the order does not exist", async () => {
  const orderId = mongoose.Types.ObjectId();
  const { body: order } = await request(app)
    .get(`/api/orders/${orderId}`)
    .set("Cookie", global.signin())
    .expect(404);
});

it("returns a 200 if the order exists", async () => {
  //   const { body: ticket } = await request(app)
  //     .post("/api/tickets")
  //     .set("Cookie", global.signin())
  //     .send({ title: "Fela", price: 98 });

  const user = global.signin();

  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "Fela",
    price: 99,
  });
  await ticket.save();

  const { body: createdOrder } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  console.log(">>>", createdOrder);

  const { body: order } = await request(app)
    .get(`/api/orders/${createdOrder.id}`)
    .set("Cookie", user)
    .expect(200);

  expect(order.id).toEqual(createdOrder.id);
});

it("returns a 401 if a user tries to fetch another users orders", async () => {
  //   const { body: ticket } = await request(app)
  //     .post("/api/tickets")
  //     .set("Cookie", global.signin())
  //     .send({ title: "Fela", price: 98 });

  const user = global.signin();

  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "Fela",
    price: 99,
  });
  await ticket.save();

  const { body: createdOrder } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  const { body: order } = await request(app)
    .get(`/api/orders/${createdOrder.id}`)
    .set("Cookie", global.signin())
    .expect(401);

  // expect(order.id).toEqual(createdOrder.id);
});
