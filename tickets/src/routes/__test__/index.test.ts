import request from "supertest";

import { app } from "../../app";

const createTicket = (title: string, price: number) => {
  return request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title, price })
    .expect(201);
};

it("can fetch a list of tickets", async () => {
  await createTicket("llllllllll", 22);
  await createTicket("fkkfkf", 32);
  await createTicket("opopopp", 62);

  const response = await request(app).get("/api/tickets").send();
  expect(response.status).toEqual(200);
  expect(response.body.length).toEqual(3);
});
