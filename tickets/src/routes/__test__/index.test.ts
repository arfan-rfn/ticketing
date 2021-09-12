import request from 'supertest';
import { app } from '../../app';

const title = 'concert';
const price = 30.3;

const createTicket = () => {
	return request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title,
			price
		});
}

it('Can fetch a lits of tickets', async () => {
	await createTicket();
	await createTicket();
	await createTicket();

	const res = await request(app)
		.get('/api/tickets')
		.send()
		.expect(200);

	expect(res.body.length).toEqual(3);
});