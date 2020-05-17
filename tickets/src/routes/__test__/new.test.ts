import request from "supertest";

import { app } from "../../app";
import { Ticket } from "../../models/tickets";

it("has a route handler listening to /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).not.toEqual(404);
});

it("can only access if user is signed in", async () => {
  await request(app).post("/api/tickets").send({}).expect(401);
});

it("returns status other than 401 if user is signed in", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({});
  expect(response.status).not.toEqual(401);
});

it("returns an error if invalid titcket title is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      price: 10,
    })
    .expect(400);
});

it("returns an error if invalid price is procvided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "fjfjdfk",
      price: -19,
    })
    .expect(400);
});

it("creates a ticket if valid inputs are provided", async () => {
  // add a check for data persisted into db
  let tickets = await Ticket.find({}); // returns all the documents

  expect(tickets.length).toEqual(0); // because in test setup db is cleared

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title: "dfjkfjkf", price: 89 })
    .expect(201);

  tickets = await Ticket.find({});

  expect(tickets.length).toEqual(1);
  expect(tickets[0].title).toEqual("dfjkfjkf");
  expect(tickets[0].price).toEqual(89);
});
