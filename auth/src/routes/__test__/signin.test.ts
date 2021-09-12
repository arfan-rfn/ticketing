import request from 'supertest';
import { app } from '../../app';

it('fails when email does not exist is supplied', async () => {
	return request(app)
		.post('/api/users/signin')
		.send({
			email: 't@t.com',
			password: 'password'
		})
		.expect(400);
});

it('fails when an incorrect password', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 't@t.com',
			password: 'password'
		})
		.expect(201);

	await request(app)
		.post('/api/users/signin')
		.send({
			email: 't@t.com',
			password: 'aklsdfji'
		})
		.expect(400);
});

it('Successful signin with cookie', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 't@t.com',
			password: 'password'
		})
		.expect(201);

	const res = await request(app)
		.post('/api/users/signin')
		.send({
			email: 't@t.com',
			password: 'password'
		})
		.expect(200);

		expect(res.get('Set-Cookie')).toBeDefined();
});