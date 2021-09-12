import mongoose from 'mongoose';
import { PasswordManager } from '../services/password-manager';

// an interface describe required properties to create a new user
interface UserAttrs {
	email: string;
	password: string;
}

// an interface that describe the properties that User Model has
interface UserModel extends mongoose.Model<UserDoc> {
	build(attr: UserAttrs): UserDoc;
}

// an interface that describe the properties that a User Documents has
interface UserDoc extends mongoose.Document {
	email: string,
	password: string,
	// add extra properties here.
	// createdAt: string,
	// updatedAt: string,
}

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		require: true
	},
	password: {
		type: String,
		require: true,
	}
}, {
	toJSON: {
		transform(doc, ret){
			delete ret.password;
			delete ret.__v;
			ret.id = ret._id;
			delete ret._id;
		}
	}
});

userSchema.pre('save', async function (done) {
	if (this.isModified('password')) {
		const hashed = await PasswordManager.toHash(this.get('password'));
		this.set('password', hashed);
	}
	done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
	return new User(attrs);
}

const User = mongoose.model<UserDoc, UserModel>('user', userSchema);

export { User };