import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/tickets';


it('return a 404 if provided id does not exist', async () => {
	const id = new mongoose.Types.ObjectId().toHexString();
	await request(app)
		.put(`/api/tickets/${id}`)
		.set('Cookie', global.signin())
		.send({
			title: 'adfa',
			price: 30
		})
		.expect(404);
});

it('return a 401 if user is not authenticate', async () => {
	const id = new mongoose.Types.ObjectId().toHexString();
	const res = await request(app)
		.post(`/api/tickets`)
		.set('Cookie', global.signin())
		.send({
			title: 'adfa',
			price: 30
		});

	await request(app)
		.put(`/api/tickets/${res.body.id}`)
		.set('Cookie', global.signin())
		.send({
			title: 'updated title',
			price: 100
		})
		.expect(401);
});

it('return a 401 if the user does not own the ticket', async () => {
	const cookie = global.signin();

	const res = await request(app)
		.post(`/api/tickets`)
		.set('Cookie', cookie)
		.send({
			title: 'adfa',
			price: 20
		});


	await request(app)
		.put(`/api/tickets/${res.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: '',
			price: 20
		})
		.expect(400);

	await request(app)
		.put(`/api/tickets/${res.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'updated title',
			price: -20
		})
		.expect(400);

});

it('return a 400 if the user provide invalid title or price', async () => {
	const cookie = global.signin();

	const res = await request(app)
		.post(`/api/tickets`)
		.set('Cookie', cookie)
		.send({
			title: 'adfa',
			price: 20
		});

	await request(app)
		.put(`/api/tickets/${res.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'updated title',
			price: 100
		})
		.expect(200);

	const ticketRes = await request(app)
		.get(`/api/tickets/${res.body.id}`)
		.send();

	expect(ticketRes.body.title).toEqual('updated title');
	expect(ticketRes.body.price).toEqual(100);
});


it('publishes an event', async () => {
	const cookie = global.signin();

	const res = await request(app)
		.post(`/api/tickets`)
		.set('Cookie', cookie)
		.send({
			title: 'adfa',
			price: 20
		});

	await request(app)
		.put(`/api/tickets/${res.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'updated title',
			price: 100
		})
		.expect(200);

	expect(natsWrapper.client.publish).toHaveBeenCalled();

});

it('rejects updates if the ticket is reserved', async () => {

	const cookie = global.signin();

	const res = await request(app)
		.post(`/api/tickets`)
		.set('Cookie', cookie)
		.send({
			title: 'adfa',
			price: 20
		});

	const ticket = await Ticket.findById(res.body.id);
	ticket!.set({orderId: mongoose.Types.ObjectId().toHexString()});
	await ticket!.save();

	await request(app)
		.put(`/api/tickets/${res.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'updated title',
			price: 100
		})
		.expect(400);
})