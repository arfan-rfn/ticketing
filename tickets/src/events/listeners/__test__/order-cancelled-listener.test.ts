import { Ticket } from "../../../models/tickets";
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCancelledListener } from "../order-cancelled-listener";
import mongoose from 'mongoose';
import { OrderCancelledEvent } from "@micro-auth/common";
import { Message } from "node-nats-streaming";

const setup = async () => {
	const listener = new OrderCancelledListener(natsWrapper.client);

	const orderId = mongoose.Types.ObjectId().toHexString();

	const ticket = Ticket.build({
		title: 'concert',
		price: 30,
		userId: 'asdf',
	});

	ticket.set({ orderId });
	await ticket.save();

	const data: OrderCancelledEvent['data'] = {
		id: orderId,
		version: 0,
		ticket: {
			id: ticket.id
		}
	}

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn()
	}

	return { listener, ticket, orderId, data, msg };
}

it('updates the ticket, publish an event, and acks the message', async () => {
	const { msg, data, ticket, orderId, listener } = await setup();

	await listener.onMessage(data, msg);

	const updatedTicket = await Ticket.findById(ticket.id);

	expect(updatedTicket!.orderId).not.toBeDefined();
	expect(msg.ack).toHaveBeenCalled();
	expect(natsWrapper.client.publish).toHaveBeenCalled();
})