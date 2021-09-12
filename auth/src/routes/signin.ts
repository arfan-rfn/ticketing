import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, ValidateRequest } from '@micro-auth/common';
import { User } from '../models/user';
import jwt from 'jsonwebtoken';
import { PasswordManager } from '../services/password-manager';

const router = express.Router();

router.post('/api/users/signin', [
	body('email')
		.isEmail()
		.withMessage('Email must be valid'),
	body('password')
		.trim()
		.notEmpty()
		.withMessage('you must supply a password')
],
	ValidateRequest,
	async (req: Request, res: Response) => {
		const { email, password } = req.body;

		const existingUser = await User.findOne({ email });
		if (!existingUser) {
			throw new BadRequestError('Invalid credentials');
		}

		const passwordMatch = await PasswordManager.compare(existingUser.password, password);
		if (!passwordMatch) {
			throw new BadRequestError('Invalid credentials');
		}

		// generate jwt
		const userJwt = jwt.sign({
			id: existingUser.id,
			email: existingUser.email
		},
			process.env.JWT_KEY!
		);

		// store it on the session object
		req.session = {
			jwt: userJwt
		};

		return res.status(200).send(existingUser);

	});

export { router as signinRouter };