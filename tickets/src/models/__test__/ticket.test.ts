import { Ticket } from "../ticket";

it("implements optimistic concurrency control(record version)", async (done) => {
  // create an instance of a ticket
  const ticket = Ticket.build({ title: "Fela", price: 10, userId: "123" });

  // save ticket to database
  await ticket.save();

  // fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstamce = await Ticket.findById(ticket.id);

  // make two seperate changes to the ticket we fetched
  firstInstance!.set({ price: 100 });
  secondInstamce!.set({ price: 200 });

  // save the first fetched ticket
  await firstInstance!.save();

  // save the second fetched ticket, it should fail
  //   expect(async() => {
  //   await secondInstamce!.save();
  //   }).toThrow()

  try {
    await secondInstamce!.save();
  } catch (err) {
    return done();
  }

  throw new Error("Should not reach this point");
});

it("increments ticket version number on save", async () => {
  const ticket = Ticket.build({ title: "Fela", price: 100, userId: "123" });
  await ticket.save();

  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);
});
