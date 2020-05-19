import { Stan, Message } from "node-nats-streaming";
import { Subjects } from "./subjects";

interface Event {
  subject: Subjects;
  data: any;
}

abstract class Listener<T extends Event> {
  abstract subject: T["subject"];
  abstract queueGroupName: string;
  abstract onMessage(data: T["data"], msg: Message): void;

  private client: Stan;
  protected ackWait = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }

  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName);
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    );

    subscription.on("message", (msg: Message) => {
      console.log(`Mesage received: ${this.subject} / ${this.queueGroupName}`);

      const parsedData = this.parseMesage(msg);

      this.onMessage(parsedData, msg);
    });
  }

  parseMesage(msg: Message) {
    const data = msg.getData();
    return typeof data === "string"
      ? JSON.stringify(data)
      : JSON.parse(data.toString("utf-8"));
  }
}

export { Listener };