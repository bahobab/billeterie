import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  requireAuth,
  NotAuthorizedError,
  NotFoundError,
  validateRequest,
} from "@billety/common";

import { Ticket } from "../models/tickets";

const router = express.Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Title must be provided"),
    body("price")
      .not()
      .isFloat({ gt: 0 })
      .withMessage("Price must be provided and greater than 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      throw new NotFoundError();
    }

    if (!req.currentUser) {
      throw new NotAuthorizedError();
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });

    await ticket.save();

    res.send(ticket);
  }
);

export { router as ticketUpdateRouter };
