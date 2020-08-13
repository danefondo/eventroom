const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const UserSchema = new Schema({
	username: String,
	email: String,
	password: {
		type: String,
		required: true,
		select: false
	},
	lastLogin: Date,
	verificationToken: String,
	resetToken: String,
	resetTokenExpires: Number,
	verifiedStatus: Boolean,
	dateCreated: Date,
});

const User = module.exports = mongoose.model('User', UserSchema);