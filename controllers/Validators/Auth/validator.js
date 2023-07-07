const Joi = require("joi");
const User = require("../../../models/Users");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../../../config/db");

const validateEmail = async (email) => {
	let user = await User.findOne({ email });
	return user ? false : true;
};

const loginSchema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string()
		.pattern(new RegExp("^[a-zA-Z0-9!@#$%^&*()_]{3,30}$"))
		.min(8)
		.required(),
});

const signupSchema = Joi.object({
	fname: Joi.string().min(1).required(),
	lname: Joi.string().min(1).required(),
	email: Joi.string().email().required(),
	password: Joi.string()
		.pattern(new RegExp("^[a-zA-Z0-9!@#$%^&*()_]{8,30}$"))
		.min(8)
		.required(),
});

const isadmin = (req, res, next) => {
	if (req.level != 0) {
		return res.status(200).json({
			reason: "unauthorized",
			message: "Endpoint not allowed",
			success: false,
		});
	} else {
		next();
	}
};

const verification = (req, res, next) => {
	if (req.verified) {
		next();
		// return res.status(200).json({
		// 	reason: "verified",
		// 	message: "user already verified",
		// 	success: false,
		// });
	} else {
		next();
	}
};

const isOTP = (req, res, next) => {
	if (req.body.otp && (req.email || req.body.email)) {
		next();
	} else {
		return res.status(404).json({
			reason: "no-OTP",
			message: "no OTP was provided! Enter otp and try again!",
			success: false,
		});
	}
};

module.exports = {
	validateEmail,
	loginSchema,
	signupSchema,
	isadmin,
	verification,
	isOTP,
};
