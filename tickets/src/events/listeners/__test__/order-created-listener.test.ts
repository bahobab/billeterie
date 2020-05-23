import { OrderCreatedEvent, OrderStatus } from "@billety/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  //create an instance of listerner
  const listerner = new OrderCreatedListener(natsWrapper.client);

  // create and save a ticket
  const ticket = Ticket.build({
    title: "Fela",
    price: 90,
    userId: "refjesuio8",
  });

  await ticket.save();

  // create fake data event
  const data: OrderCreatedEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: "reklfdkl",
    expiresAt: "fdjsolf",
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // ack the message
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listerner, ticket, data, msg };
};

it("sets the user id of the ticket", async () => {
  const { listerner, ticket, data, msg } = await setup();

  await listerner.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket?.orderId).toEqual(data.id);
});

it("acks the message", async () => {
  const { listerner, ticket, data, msg } = await setup();
  await listerner.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const { listerner, ticket, data, msg } = await setup();

  await listerner.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  // @ts-ignore
  // console.log(natsWrapper.client.publish.mock.calls);

  const updatedTicket = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  ); // TS safe version of the above
  // console.log(updatedTicket);
  expect(data.id).toEqual(updatedTicket.orderId);
});
