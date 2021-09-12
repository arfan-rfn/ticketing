import { BadRequestError, NotFoundError, OrderStatus, RequireAuth, ValidateRequest } from '@micro-auth/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { OrderCreatedPublisher } from '../events/publisher/order-created-publisher';
import { Order } from '../models/order';
import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();
const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router.post(
	'/api/orders',
	RequireAuth,
	[
		body('ticketId')
			.not()
			.isEmpty()
			// .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
			.withMessage('TicketId must be provided')
	],
	ValidateRequest,
	async (req: Request, res: Response) => {
		const { ticketId } = req.body;
		// Find the ticket the user is trying to order the ticket in the DB
		const ticket = await Ticket.findById(ticketId);
		if (!ticket) {
			throw new NotFoundError();
		}

		// Make sure that the ticket is already is not reserved.
		const isReserved = await ticket.isReserved();

		if (isReserved) {
			throw new BadRequestError('Ticket is already reserved');
		}

		// Calculate an expiration date for this order.
		const expiration = new Date();
		expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

		// Build the order and save it the DB
		const order = Order.build({
			userId: req.currentUser!.id,
			status: OrderStatus.Created,
			expireAt: expiration,
			ticket: ticket,
		});
		await order.save();

		// Publish an event saying an order was created.
		new OrderCreatedPublisher(natsWrapper.client).publish({
			id: order.id,
			version: order.version,
			status: order.status,
			userId: order.userId,
			expiresAt: order.expireAt.toISOString(),
			ticket: {
				id: ticket.id,
				price: ticket.price
			}
		});

		res.status(201).send(order);
	});

export { router as NewOrderRouter }