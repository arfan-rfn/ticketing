import request from 'supertest';
import { app } from '../../app';

it('response with details about the current user', async () => {
	// const authRes = await request(app)
	// 	.post('/api/users/signup')
	// 	.send({
	// 		email: 't@t.com',
	// 		password: 'password'
	// 	})
	// 	.expect(201);

	// Look at test/setup.ts for the signin() declaration
	const cookie = await global.signin();

	const res = await request(app)
		.get('/api/users/currentuser')
		.set('Cookie', cookie)
		.send()
		.expect(200);

	expect(res.body.currentUser.email).toEqual('t@t.com');
});

it('response with null if not authenticate', async () => {
	const res = await request(app)
		.get('/api/users/currentuser')
		.send()
		.expect(200);

	expect(res.body.currentUser).toEqual(null);
});
