import { Message } from "node-nats-streaming";
import { Listener, OrderCreatedEvent, Subjects } from "@billety/common";

import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { natsWrapper } from "../../nats-wrapper";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;

  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    // find the ticket being reserved
    const ticket = await Ticket.findById(data.ticket.id);

    // if error throw error
    if (!ticket) {
      throw new Error("Reserving: Ticket not found!");
    }
    // mark the tiket as reserved by setting the order id
    ticket.set({ orderId: data.id });
    // save ticket
    await ticket.save();
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version,
    });

    // ack the message
    msg.ack();
  }
}
