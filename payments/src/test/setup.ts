import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';
import jwt from 'jsonwebtoken';

declare global {
	var signin: (id?: string) => string[];
}

jest.mock('../nats-wrapper');

// This key is needed as soon as the required statement
process.env.STRIPE_KEY = 'sk_test_51JWntmILLX6QHARXPC9GwVmMKLyswUbKN4H2pDto5Nw49QmM8l84o94U5kmMKvPiZMtB3v0l3RUTKSpf7dNGMsbQ00jGdyyKCR';

let mongo: any;
beforeAll(async () => {
	process.env.JWT_KEY = 'asdfasdf';

	mongo = await MongoMemoryServer.create();
	const mongoUri = mongo.getUri();

	await mongoose.connect(mongoUri, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});
});

beforeEach(async () => {
	jest.clearAllMocks();
	const collections = await mongoose.connection.db.collections();

	for (let collection of collections) {
		await collection.deleteMany({});
	}
});

afterAll(async () => {
	await mongo.stop();
	await mongoose.connection.close();
});


global.signin = (id?: string) => {
	// Build a JWT payload {id, email}
	const payload = {
		id: id || new mongoose.Types.ObjectId().toString(),
		email: 'test@test.com'
	}

	// Create the JWT!
	const token = jwt.sign(payload, process.env.JWT_KEY!);

	// Build Session object {jwt: MY_JWT}
	const session = { jwt: token };

	// Turn that session into JSON
	const sessionJSON = JSON.stringify(session);

	// Take JSON and encode it as base64
	const base64 = Buffer.from(sessionJSON).toString('base64');

	// return string that the cookie with the encoded data
	return [`express:sess=${base64}`];

};