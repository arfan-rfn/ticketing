import { BadRequestError, NotAuthorized, NotFoundError, RequireAuth, ValidateRequest } from '@micro-auth/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { Ticket } from '../models/tickets';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router()


router.put(
	'/api/tickets/:id',
	[
		body('title')
			.not()
			.isEmpty()
			.withMessage('title must be valid'),
		body('price')
			.isFloat({ gt: 0 })
			.withMessage('Price must be provided and greater than 0')
	],
	ValidateRequest,
	RequireAuth,
	async (req: Request, res: Response) => {
		const ticket = await Ticket.findById(req.params.id);

		if (!ticket) {
			throw new NotFoundError();
		}

		if (ticket.orderId) {
			throw new BadRequestError('Cannot edit a reserved ticket');
		}

		if (ticket.userId !== req.currentUser!.id) {
			throw new NotAuthorized();
		}

		const { title, price } = req.body;

		ticket.set({
			title,
			price
		});

		await ticket.save();

		await new TicketUpdatedPublisher(natsWrapper.client).publish({
			id: ticket.id,
			version: ticket.version,
			title: ticket.title,
			price: ticket.price,
			userId: ticket.userId
		});
		res.send(ticket);
	});

export { router as UpdateTicketRouter }