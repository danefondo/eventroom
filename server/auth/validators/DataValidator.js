const { check, validationResult } = require('express-validator');
const { checkIfUserWithValueExists } = require('../../../database/user/UserUtilities'); // TODO to remove



module.exports = {
	register: [
		// TODO: Send db request just once, then print necessary error messages. <- low priority, probs no signifant speedup, just fancy
		check('email').trim().escape().normalizeEmail()
			.isEmail().withMessage("Please insert an email address")
			.custom(value => {
				return checkIfUserWithValueExists('email', value).then(exists => {
					if (exists) {
						return Promise.reject("Email already exists");
					}
				});
			}),
		check('username').trim().escape()
			.not().isEmpty().withMessage('Username cannot be empty')
			.not().isEmail().withMessage('Username cannot be an email address')
			.custom(value => {
				return checkIfUserWithValueExists('username', value).then(exists => {
					if (exists) {
						return Promise.reject("Username already exists");
					}
				});
			}),
		check('password').trim().escape()
			.isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
			.isLength({ max: 80 }).withMessage('Password must be less than 80 characters')
			.custom((value, { req }) => {
				if (value === req.body.email || value === req.body.username) {
					throw new Error("Password can't equal the email address or username");
				} else {
					return value;
				}
			}),
		check('passcheck').trim().escape()
			.custom((value, { req }) => {
				if (value !== req.body.password) {
					throw new Error("Passwords don't match");
				} else {
					return value;
				}
			})

	],

	login: [
		check('username').trim().escape()
			.isEmail().bail()
			.normalizeEmail()
	],

	check_email: [
		check('email').isEmail()
			.custom(value => {
				return checkIfUserWithValueExists('email', value).then(exists => {
					if (exists) {
						return Promise.reject("Email already exists");
					}
				});
			})
  ],

  check_username: [
		check('username').not().isEmpty()
			.withMessage('Username cannot be empty.')
			.custom(value => {
				return checkIfUserWithValueExists('username', value).then(exists => {
					if (exists) {
						return Promise.reject("Username already exists");
					}
				});
			})
	],

	forgotPass: [
		check('email').trim().escape().isEmail().normalizeEmail()
	],

	passwordReset: [
		check('newPassword').trim().escape()
			.isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
			.isLength({ max: 80 }).withMessage('Password must be less than 80 characters')
			.custom((value, { req }) => {
				if (value === req.body.email || value === req.body.username) {
					throw new Error("Password can't equal the email address or username");
				} else {
					return value;
				}
			}),
	],

	imageValidate: [
		 check('fileName').not().isEmpty()
		 	.withMessage('File name is required'),
		 check('fileURL').not().isEmpty()
		 	.withMessage('File url is required')
	],
	checkSignUpEmail: [
		check('email').isEmail().withMessage('Email empty or in incorrect format')
   ],
}