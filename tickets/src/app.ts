import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { NotFoundError, errorHandler, CurrentUser } from '@micro-auth/common';
import { createTicketsRouter } from './routes/new';
import { showTicketRouter } from './routes/show';
import { IndexTicketRouter } from './routes/index';
import { UpdateTicketRouter } from './routes/update';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
	cookieSession({
		signed: false,
		// secure: process.env.NODE_ENV !== 'test',
		secure: false,
	})
);

// global middleware
app.use(CurrentUser);

// Setting up the router
app.use(createTicketsRouter);
app.use(showTicketRouter);
app.use(IndexTicketRouter);
app.use(UpdateTicketRouter);


app.all('*', async (req, res) => {
	throw new NotFoundError();
});

app.use(errorHandler);

export { app };