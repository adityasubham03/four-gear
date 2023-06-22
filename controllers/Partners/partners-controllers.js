const partnerRefreshToken = require("../../models/partnerRefreshToken");
const Partners = require("../../models/partners");
const bookings = require("../../models/bike-booking");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_REFRESH_TOKEN_SECRET } = require("../../config/db");

const {
	partnerRegisterSchema,
	partnerloginSchema,
} = require("../Validators/Partners/validators");
const { json } = require("express");

const Register_MSG = {
	signupSuccess: "You are successfully signed up for the partners programme.",
	signupError: "Unable to submit the data. Please try again later!!",
	noDataError: "No data found",
	signupExists: "User Already Exists! Please Login",
};

const Login_MSG = {
	usernameNotExist: "Email is not found. Invalid login credentials.",
	wrongRole: "Please make sure this is your identity.",
	loginSuccess: "You are successfully logged in.",
	wrongPassword: "Incorrect password.",
	loginError: "Oops! Something went wrong.",
};

const register = async (req, res, next) => {
	try {
		const level = 2;
		const partnersDetails = await partnerRegisterSchema.validateAsync(req.body);
		const phone = req.body.phone;
		const partnerUser = await Partners.findOne({ phone: phone });
		if (partnerUser) {
			return res.status(400).json({
				message: Register_MSG.signupExists,
				success: false,
			});
		}

		let pass = req.body.password;
		const password = await bcrypt.hash(pass, 12);
		const partners = new Partners({
			...partnersDetails,
			level,
			password,
		});
		partners.save();
		return res.status(201).json({
			message: Register_MSG.signupSuccess,
			success: true,
		});
	} catch (err) {
		let errorMsg = Register_MSG.signupError;
		if (err.isJoi === true) {
			err.status = 403;
			errorMsg = err.message;
		}
		console.log(err);
		return res.status(err.status).json({
			message: errorMsg,
			success: false,
		});
	}
};

const login = async (req, res, next) => {
	try {
		const LoginRequest = await partnerloginSchema.validateAsync(req.body);
		let { phone, password } = req.body;
		let user;
		let refreshTokenColl;
		if (phone) {
			user = await Partners.findOne({ phone });
			refreshTokenColl = await partnerRefreshToken.findOne({ phone });
		}

		if (!user) {
			return res.status(404).json({
				reason: "phone",
				message: Login_MSG.usernameNotExist,
				success: false,
			});
		}

		let isMatch = await bcrypt.compare(password, user.password);
		if (isMatch) {
			let token = jwt.sign(
				{
					_id: user._id,
					fname: user.name,
					phone: user.phone,
					level: user.level,
				},
				JWT_SECRET,
				{ expiresIn: "20s" }
			);

			let refreshToken = jwt.sign(
				{
					_id: user._id,
					fname: user.name,
					phone: user.phone,
					level: user.level,
				},
				JWT_REFRESH_TOKEN_SECRET
			);

			if (!refreshTokenColl) {
				const newRefreshTokenColl = new partnerRefreshToken({
					phone,
					refreshToken,
				});
				newRefreshTokenColl.save();
			}

			if (refreshTokenColl) {
				partnerRefreshToken
					.updateOne(
						{ phone: user.phone },
						{ $push: { refreshToken: refreshToken } }
					)
					.then((result) => {
						console.log("Successfully updated the refresh token");
					})
					.catch((err) => {
						return res.status(404).json({
							reason: "email",
							message:
								"Cannot able To add the refresh token to the list of known refresh token",
							success: false,
						});
						console.error(err);
					});
			}

			let result = {
				_id: user._id,
				name: user.name,
				phone: user.phone,
				level: user.level,
				token: token,
				refreshToken: refreshToken,
				expiresIn: "20s",
			};

			return res.status(200).json({
				...result,
				message: Login_MSG.loginSuccess,
				success: true,
			});
		} else {
			return res.status(401).json({
				reason: "password",
				message: Login_MSG.wrongPassword,
				success: false,
			});
		}
	} catch (err) {
		console.log;
		let errorMsg = Login_MSG.loginError;
		if (err.isJoi === true) {
			err.status = 403;
			errorMsg = err.message;
		}
		console.log(err);
		return res.status(500).json({
			reason: "server",
			message: errorMsg,
			success: false,
		});
	}
};

const verifytoken = (req, res, next) => {
	console.log("Entered");
	if (req.headers["authorization"]) {
		const cookies = req.headers["authorization"];
		// console.log(cookies);
		try {
			token = cookies.split(" ")[1];
		} catch (err) {
			console.log(err);
		}
	} else {
		return res.status(200).json({
			reason: "unauthorized",
			message: "Session not found",
			success: false,
		});
	}

	if (!token) {
		return res.status(200).json({
			reason: "unauthorized",
			message: "token not found",
			success: false,
		});
	}

	jwt.verify(String(token), JWT_SECRET, (err, user) => {
		if (err) {
			return res.status(400).json({
				reason: "unauthorized",
				message: "Invalid token",
				success: false,
			});
		} else {
			req._id = user._id;
			req.name = user.name;
			req.phone = user.phone;
			req.level = user.level;
			req.token = token;
			next();
		}
	});
};

const verifyRefreshToken = async (req, res, next) => {
	if (req.headers["authorization"]) {
		const cookies = req.headers["authorization"];
		try {
			token = cookies.split(" ")[1];
		} catch (err) {
			console.log(err);
		}
	} else {
		return res.status(200).json({
			reason: "unauthorized",
			message: "Session not found",
			success: false,
		});
	}

	if (!token) {
		return res.status(200).json({
			reason: "unauthorized",
			message: "token not found",
			success: false,
		});
	}

	jwt.verify(String(token), JWT_REFRESH_TOKEN_SECRET, (err, user) => {
		if (err) {
			return res.status(400).json({
				reason: "unauthorized",
				message: "Invalid token",
				success: false,
			});
		} else {
			req._id = user._id;
			req.name = user.name;
			req.phone = user.phone;
			req.level = user.level;
			req.token = token;
			next();
		}
	});
};

// const get = async (req, res, next) => {
// 	let partners;
// 	const id = req.params.id;
// 	try {
// 		if (id) {
// 			partners = await Partners.findById(id);
// 		} else {
// 			partners = await Partners.find();
// 		}
// 	} catch (err) {
// 		console.log(err);
// 		return res.status(400).json({
// 			message: Register_MSG.noDataError,
// 			success: false,
// 		});
// 	}
// 	if (!partners) {
// 		return res.status(404).json({
// 			message: Register_MSG.noDataError,
// 			success: true,
// 		});
// 	}
// 	return res.status(200).json({
// 		partners,
// 		success: true,
// 	});
// };

const getuser = async (req, res, next) => {
	let user;
	if (req._id) {
		const userid = req._id;
		try {
			user = await Partners.findById(userid, "-password");
		} catch (err) {
			return new Error(err);
		}
	} else if (req.phone) {
		const phone = req.phone;
		try {
			user = await Partners.findOne({ phone: phone });
		} catch (err) {
			return new Error(err);
		}
	}
	if (!user) {
		return res.status(404).json({ message: "User not found!!" });
	}
	let r;
	if (req.token) {
		let token = req.token;
		r = {
			token,
			user,
		};
	} else {
		r = user;
	}
	return res.status(200).json(r);
};

const refresh = async (req, res, next) => {
	let refreshTokenColl;
	var phone = req.phone;
	console.log(phone);
	refreshTokenColl = await partnerRefreshToken.findOne({ phone: phone });
	console.log(refreshTokenColl);

	if (!refreshTokenColl) {
		return res.status(400).json({
			reason: "unauthorized",
			message: "Invalid token",
			success: false,
		});
	} else {
		let token = jwt.sign(
			{
				_id: req._id,
				name: req.name,
				phone: req.phone,
				level: req.level,
			},
			JWT_SECRET,
			{ expiresIn: "20s" }
		);
		return res.status(200).json({
			token,
			message: "Refreshed Successfulyl",
			success: true,
		});
	}
};

const service = async (req, res, next) => {
	try {
		const phone = req.phone;
		console.log(phone);
		const services = await bookings.find({
			assignedTo: phone,
			isAbandoned: false,
		});
		console.log(services);
		if (services[0]) {
			return res.status(200).json({
				data: { ...services },
				success: true,
			});
		} else {
			return res.status(404).json({
				data: "No data found",
				success: true,
			});
		}
	} catch (err) {
		console.log(err);
		return res.status(500).json({
			reason: "server",
			message:
				"An error was encountered on the server! Please try again later.",
			success: false,
		});
	}
};

module.exports = {
	register,
	login,
	verifytoken,
	verifyRefreshToken,
	getuser,
	refresh,
	service,
};
