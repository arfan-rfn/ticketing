import { RequireAuth, ValidateRequest } from '@micro-auth/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { Ticket } from '../models/tickets';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
	'/api/tickets',
	RequireAuth,
	[
		body('title')
			.not()
			.isEmpty()
			.withMessage('Title is required'),
		body('price')
			.isFloat({ gt: 0 })
			.withMessage('Price must be grater than 0')
	],
	ValidateRequest,
	async (req: Request, res: Response) => {

		const { title, price } = req.body;
		const ticket = Ticket.build({
			title,
			price,
			userId: req.currentUser!.id
		});
		await ticket.save();

		await new TicketCreatedPublisher(natsWrapper.client).publish({
			id: ticket.id,
			version: ticket.version,
			title: ticket.title,
			price: ticket.price,
			userId: ticket.userId
		});

		res.status(201).send(ticket);

	});

export { router as createTicketsRouter };