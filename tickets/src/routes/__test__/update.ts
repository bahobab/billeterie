import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";

const createTicketId = () => {
  return mongoose.Types.ObjectId().toHexString();
};

const createTicket = (title: string, price: number) => {
  return request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title, price })
    .expect(201);
};

it("returns a 404 if the provided id does not exist", async () => {
  const ticketId = createTicketId();

  await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set("Cookie", global.signin())
    .send()
    .expect(404);
});

it("returns a 401 if the user is not authenticated", async () => {
  const ticketId = createTicketId();
  await request(app)
    .put(`/api/tickets/${ticketId}`)
    .send({ title: "djdjdj", price: 65 })
    .expect(401);
});

it("returns a 401 if the user does not own the ticket", async () => {
  //   const response = await createTicket("fkfkfk", 32);
  //   console.log(response.body);
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title: "dkjfdjfg", price: 33 });

  const res = await request(app)
    .put(`api/tickets/${response.body.id}`)
    .set("Cookie", global.signin())
    .send({ title: "oooooooooo", price: 90 })
    .expect(401);

  //     console.log(response.body)

  //   console.log(res.body);
  //   expect(res.body).toEqual({});
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
    .expect(200);

  expect(updatedResponse.body.title).toEqual("yoyoyo");
  expect(updatedResponse.body.price).toEqual(9999);
});
