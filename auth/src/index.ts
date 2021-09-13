import mongoose from 'mongoose';
import { app } from './app';
import { DatabaseConnectionError } from '@micro-auth/common';

const start = async () => {
	console.log('Starting up......');

	if (!process.env.JWT_KEY) {
		throw new Error("JWT_KEY must be define");
	}

	if (!process.env.MONGO_URI) {
		throw new Error("MONGO_URI must be define");
	}
	try {
		await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true
		});
		console.log('connected to auth mongodb');

	} catch (error) {
		throw new DatabaseConnectionError();
	}
	app.listen(3000, () => {
		console.log('Listening on auth port 3000');
	});
}

start();
