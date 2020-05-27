import { OrderCancelledEvent, OrderStatus } from "@billety/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { Order } from "../../../models/orders";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userId: "fggsd",
    version: 0,
    price: 43,
  });

  await order.save();

  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    version: 1,
    ticket: { id: "jkfd" },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("updates the status of an order", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(order?.status).toEqual(OrderStatus.Cancelled);
});

it("acks the cancelled message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
