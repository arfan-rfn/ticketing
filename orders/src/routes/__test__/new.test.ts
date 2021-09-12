import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';


it("return an error if the ticket does not exist", async () => {
	const ticketId = mongoose.Types.ObjectId();

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({ ticketId })
		.expect(404);
});

it("return an error if the ticket is already reserved", async () => {
	const ticket = Ticket.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 30
	});
	await ticket.save();

	const order = Order.build({
		ticket,
		userId: 'aldifjkdsf',
		status: OrderStatus.Created,
		expireAt: new Date()
	});
	await order.save();

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({
			ticketId: ticket.id
		})
		.expect(400);
});

it("reserves a ticket", async () => {
	const ticket = Ticket.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 30
	});
	await ticket.save();

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({
			ticketId: ticket.id
		})
		.expect(201);

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({
			ticketId: ticket.id
		})
		.expect(400);
});

it('Emits an order created event', async () => {

	const ticket = Ticket.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 30
	});
	await ticket.save();

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({
			ticketId: ticket.id
		})
		.expect(201);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});