const Dotenv = require('dotenv');
Dotenv.config();

const apiKey = process.env.MAILGUN_TOKEN;
const domain = process.env.MAILGUN_DOMAIN;
const Mailgun = require('mailgun-js')({apiKey: apiKey, domain: domain});
 

module.exports = {
	sendVerificationMail(email, link) {
		const data = {
		  from: 'Eventroom.to <noreply@eventroom.to>',
		  to: email,
		  subject: 'Please verify your email address',
		  html: '',
		  text: `Please verify your account by clicking on the link. ${link}`
		};
		Mailgun.messages().send(data, function (error, body) {
		  console.log(body);
		});
	},

	sendWelcomeEmail(email, link) {
		const data = {
		  from: 'Eventroom.to <noreply@eventroom.to>',
		  to: email,
		  subject: 'Welcome to Eventroom.to!',
		  html: '',
		  text: `Welcome to Eventroom.to! We're glad you've decided to join us. We're still new and just starting to flap our unicorn wings, which is why we especially value that you join us! Take a peak and stay tuned for new features will be popping up left and right! Enjoy your stay and enjoy fitness!`
		};
		Mailgun.messages().send(data, function (error, body) {
		  console.log(body);
		});
	},

	sendVideoSignUpEmail(email, streamName, link) {
		const data = {
		  from: 'Eventroom.to <noreply@eventroom.to',
		  to: email,
		  subject: `Registreerisid vaatama ${streamName}`,
		  html: '',
		  text: `Ära muretse! Tuletame sulle meelde kohe kui ${streamName} eetrisse läheb! Seniks, mine uudista Eeter.tv lehel ringi, äkki leiad midagi muud põnevat. ${link}`
		};
		Mailgun.messages().send(data, function (error, body) {
		  console.log(body);
		});
	},


	sendVideoSignUpReminderEmail30(email, link) {
		const data = {
		  from: 'Eventroom.to <noreply@eventroom.to>',
		  to: email,
		  subject: `Kohe eetris: ${stream_name}`,
		  html: '',
		  text: `Ära unusta! ${stream_name} on juba 30 minuti pärast eetris!`
		};
		Mailgun.messages().send(data, function (error, body) {
		  console.log(body);
		});
	},

	sendVideoSignUpReminderEmail(email, stream, link) {
		const data = {
		  from: 'Eventroom.to <noreply@eventroom.to>',
		  to: email,
		  subject: `${stream.stream_name} on eetris!`,
		  html: '',
		  text: `${stream.stream_name} on juba eetris! Tõtta vaatama! ${link}`
		};
		Mailgun.messages().send(data, function (error, body) {
		  console.log(body);
		});
	},


	sendResetMail(email, link) {
		const data = {
		  from: 'Eventroom.to <noreply@eventroom.to>',
		  to: email,
		  subject: 'Reset password for your Eventroom.to account',
		  html: '',
		  text: `To reset your password, click on this link ${link}. The link expires in 30 minutes.`
		};
		Mailgun.messages().send(data, function (error, body) {
		  console.log(body);
		});
	},

	sendInterestReceived(email, stream) {
		const data = {
		  from: 'Eventroom.to <noreply@eventroom.to>',
		  to: email,
		  subject: `Soovisid minna eetrisse?`,
		  html: '',
		  text: `Meil on väga hea meel, et oled huvitatud oma sisu Eeter.tv keskkonnas jagama. Su
		  soov jõudis meieni ja võtame sinuga ühendust!`
		};
		Mailgun.messages().send(data, function (error, body) {
		  console.log(body);
		});
	}
}
