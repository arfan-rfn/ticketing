import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@micro-auth/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

// jest.mock('../../stripe');

it('returns 404 when the order does not exist', async () => {
	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin())
		.send({
			token: 'alsdfi',
			orderId: mongoose.Types.ObjectId().toString()
		})
		.expect(404);
});

it('returns 401 when purchasing an order that does not belong to the user', async () => {
	const order = Order.build({
		id: mongoose.Types.ObjectId().toString(),
		userId: mongoose.Types.ObjectId().toString(),
		version: 0,
		price: 39,
		status: OrderStatus.Created
	});
	await order.save();

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin())
		.send({
			token: 'alsdfi',
			orderId: order.id
		})
		.expect(401);
});

it('returns 400 when purchasing a cancelled order', async () => {
	const userId = mongoose.Types.ObjectId().toString();
	const order = Order.build({
		id: mongoose.Types.ObjectId().toString(),
		userId: userId,
		version: 0,
		price: 39,
		status: OrderStatus.Cancelled
	});
	await order.save();

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin(userId))
		.send({
			token: 'alsdfi',
			orderId: order.id
		})
		.expect(400);
});

it('returns 204 with valid input', async () => {
	const userId = mongoose.Types.ObjectId().toString();
	const price = Math.floor(Math.random() * 100000);
	const order = Order.build({
		id: mongoose.Types.ObjectId().toString(),
		userId: userId,
		version: 0,
		price,
		status: OrderStatus.Created
	});
	await order.save();

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin(userId))
		.send({
			token: 'tok_visa',
			orderId: order.id
		})
		.expect(201);

	const stripeCharges = await stripe.charges.list({ limit: 50 });

	const stripeCharge = stripeCharges.data.find(charge => {
		return charge.amount === price * 100;
	});

	// console.log(stripeCharge);

	expect(stripeCharge).toBeDefined();
	expect(stripeCharge!.currency).toEqual('usd');

	// const chargeOption = (stripe.charges.create as jest.Mock).mock.calls[0][0];
	// expect(chargeOption.source).toEqual('tok_visa');
	// expect(chargeOption.amount).toEqual(order.price * 100);
	// expect(chargeOption.currency).toEqual('usd');

	const payment = await Payment.findOne({
		orderId: order.id,
		stripeId: stripeCharge!.id
	});

	expect(payment).not.toBeNull();
});