import mongoose from "mongoose";
import { OrderCreatedEvent, OrderStatus } from "@billety/common";
import { Message } from "node-nats-streaming";

import { natsWrapper } from "../../../nats-wrapper";
import { Order } from "../../../models/orders";
import { OrderCreatedListener } from "../order-created-listener";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);
  const data: OrderCreatedEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    userId: "fddjkfjl",
    status: OrderStatus.Created,
    version: 0,
    expiresAt: "fkfdlfg",
    ticket: { id: mongoose.Types.ObjectId().toHexString(), price: 29 },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("replicates the order info", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(order?.price).toEqual(data.ticket.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
