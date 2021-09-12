import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { NotFoundError, errorHandler, CurrentUser } from '@micro-auth/common';
import { deleteOrderRouter } from './routes/delete';
import { NewOrderRouter } from './routes/new';
import { indexOrderRouter } from './routes/index';
import { showOrderRouter } from './routes/show';

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
app.use(deleteOrderRouter);
app.use(NewOrderRouter);
app.use(indexOrderRouter);
app.use(showOrderRouter);


app.all('*', async (req, res) => {
	throw new NotFoundError();
});

app.use(errorHandler);

export { app };