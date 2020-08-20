const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const UserSchema = new Schema({
    // Auth
    username: String,
	email: String,
	password: {
		type: String,
		required: false,		// unnecessary for FB, Google auth strategies
		select: false
	},

    // Personal
	firstName: String,
	lastName: String,
	businessName: String,
	displayName: String,

    // Provider
	providerId: String,
	provider: String,

    // Verification
    verificationToken: String,
    verifiedStatus: Boolean,

    // Date
    dateCreated: Date,
	lastLogin: Date,
    
    // Reset
	resetToken: String,
	resetTokenExpires: Number,
});

const User = module.exports = mongoose.model('User', UserSchema);