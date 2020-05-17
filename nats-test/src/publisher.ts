import nats from "node-nats-streaming";

import { TicketCreatedPublisher } from "./events/ticket-created-publisher";

console.clear();

const stan = nats.connect("billety", "abc", {
  url: "http://localhost:4222",
});

stan.on("connect", async () => {
  console.log("Publisher connected to NATS");

  const data = {
    id: "123",
    title: "concert",
    price: 16,
  };
  try {
    await new TicketCreatedPublisher(stan).publish(data);
  } catch (err) {
    console.error(err);
  }
});
