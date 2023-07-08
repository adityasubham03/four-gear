const User = require("../../models/Users");
const RefreshToken = require("../../models/refreshToken");
const Auth = require("../../models/auth");
const { mailer } = require("../Mailer/mailer");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

const {
	loginSchema,
	signupSchema,
	validateEmail,
} = require("../Validators/Auth/validator");

const { JWT_SECRET, JWT_REFRESH_TOKEN_SECRET } = require("../../config/db");

const Login_MSG = {
	usernameNotExist: "Email is not found. Invalid login credentials.",
	wrongRole: "Please make sure this is your identity.",
	loginSuccess: "You are successfully logged in.",
	wrongPassword: "Incorrect password.",
	loginError: "Oops! Something went wrong.",
};

const Register_MSG = {
	usernameExists: "Username is already taken.",
	emailExists: "Email is already registered.",
	signupSuccess: "You are successfully signed up.",
	signupError: "Unable to create your account.",
};

// const otpgen = (length) => {
// 	const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
// 	const digits = "0123456789";
// 	let otp = "";

// 	let alphabetCount = 0;
// 	let hasMinimumOneAlphabet = false;

// 	for (let i = 0; i < length; i++) {
// 		let randomIndex;

// 		if (
// 			(alphabetCount < 2 && Math.random() < 0.5) ||
// 			(i === length - 1 && !hasMinimumOneAlphabet)
// 		) {
// 			// If the current count of alphabets is less than 2 and random condition is met,
// 			// or if it is the last character and there has not been minimum one alphabet yet,
// 			// ensure the character is an alphabet.
// 			randomIndex = Math.floor(Math.random() * alphabets.length);
// 			otp += alphabets[randomIndex];
// 			alphabetCount++;
// 			hasMinimumOneAlphabet = true;
// 		} else {
// 			// Otherwise, add a random digit.
// 			randomIndex = Math.floor(Math.random() * digits.length);
// 			otp += digits[randomIndex];
// 		}
// 	}

// 	return otp;
// };

const otpgen = (n) => {
	const digits = "0123456789";
	let otp = "";

	for (let i = 0; i < n; i++) {
		const randomIndex = Math.floor(Math.random() * digits.length);
		otp += digits[randomIndex];
	}

	return otp;
};

let refreshTokensCollection = [];

const register = async (req, res, next) => {
	const auth_type = "acc_verify";
	try {
		const level = 1;
		const signupRequest = await signupSchema.validateAsync(req.body);
		let email = signupRequest.email;
		let emailNotRegistered = await User.findOne({email});
		
		if (emailNotRegistered) {
			if (emailNotRegistered.verified == false) {
				try {
					const password = await bcrypt.hash(signupRequest.password, 12);
					emailNotRegistered.password = password;
					await emailNotRegistered.save();
					let auth = Auth.findOne({ email, auth_type });
					let otp;
					if (auth) {
						otp = auth.otp;
					} else {
						otp = otpgen(4);
						auth = new Auth({
							email,
							username: email,
							auth_type,
							otp,
						});

						try {
							await auth.save();
						} catch (err) {
							console.log(err);
							return res.status(500).json({
								reason: "error",
								message: "Internal Server Error! Cannot generate OTP!",
								success: false,
							});
						}
					}
					await mailer(
						emailNotRegistered.email,
						"OTP for verification of FourGear Account",
						`Your OTP is:- ${otp}`,
						emailNotRegistered.email,
						auth_type
					);
				} catch (err) {
					return res.status(500).json({
						reason: "server",
						message:
							"Internal Server Error! Cannot Send Mail. Please try again later!!",
						success: false,
					});
				}
				return res.status(409).json();
			}
			return res.status(400).json({
				message: Register_MSG.emailExists,
				success: false,
			});
		}
		let pass = req.body.password;
		const password = await bcrypt.hash(pass, 12);
		const newUser = new User({
			...signupRequest,
			password,
			level,
		});

		await newUser.save();

		otp = otpgen(4);
		const auth = new Auth({
			email,
			username: email,
			auth_type,
			otp,
		});

		try {
			await auth.save();
		} catch (err) {
			console.log(err);
			return res.status(500).json({
				reason: "error",
				message: "Internal Server Error! Cannot generate OTP!",
				success: false,
			});
		}

		try {
			await mailer(
				email,
				"OTP for verification of FourGear Account",
				`Your OTP is:- ${otp}`,
				email,
				auth_type
			);
		} catch (err) {
			return res.status(500).json({
				reason: "server",
				message:
					"Internal Server Error! Cannot Send Mail. Please try again later!!",
				success: false,
			});
		}

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
		const LoginRequest = await loginSchema.validateAsync(req.body);
		let { email, password } = req.body;
		let user;
		let refreshTokenColl;
		if (email) {
			user = await User.findOne({ email });
			refreshTokenColl = await RefreshToken.findOne({ email });
		}

		if (!user) {
			return res.status(404).json({
				reason: "email",
				message: Login_MSG.usernameNotExist,
				success: false,
			});
		}

		let isMatch = await bcrypt.compare(password, user.password);
		if (isMatch) {
			let token = jwt.sign(
				{
					_id: user._id,
					fname: user.fname,
					lname: user.lname,
					email: user.email,
					level: user.level,
					verified: user.verified,
				},
				JWT_SECRET,
				{ expiresIn: "20s" }
			);

			let refreshToken = jwt.sign(
				{
					_id: user._id,
					fname: user.fname,
					lname: user.lname,
					email: user.email,
					level: user.level,
					verified: user.verified,
				},
				JWT_REFRESH_TOKEN_SECRET
			);

			if (!refreshTokenColl) {
				const newRefreshTokenColl = new RefreshToken({
					email,
					refreshToken,
				});
				newRefreshTokenColl.save();
			}

			if (refreshTokenColl) {
				RefreshToken.updateOne(
					{ email: user.email },
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
				fname: user.fname,
				lname: user.lname,
				email: user.email,
				level: user.level,
				verified: user.verified,
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
	if (req.headers["authorization"]) {
		const cookies = req.headers["authorization"];
		// console.log(cookies);
		try {
			token = cookies.split(" ")[1];
		} catch (err) {
			console.log(err);
		}
	} else {
		return res.status(400).json({
			reason: "unauthorized",
			message: "Session not found",
			success: false,
		});
	}

	if (!token) {
		return res.status(400).json({
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
			req.fname = user.fname;
			req.lname = user.lname;
			req.email = user.email;
			req.phone = user.phone;
			req.level = user.level;
			req.verified = user.verified;
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
		return res.status(400).json({
			reason: "unauthorized",
			message: "Session not found",
			success: false,
		});
	}

	if (!token) {
		return res.status(400).json({
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
			req.fname = user.fname;
			req.lname = user.lname;
			req.email = user.email;
			req.level = user.level;
			req.verified = user.verified;
			req.token = token;
			next();
		}
	});
};

const getuser = async (req, res, next) => {
	let user;
	if (req._id) {
		const userid = req._id;
		try {
			user = await User.findById(userid, "-password");
		} catch (err) {
			return new Error(err);
		}
	} else if (req.email) {
		const email = req.body.email;
		try {
			user = await User.findOne({ email: email });
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
	var email = req.email;
	refreshTokenColl = await RefreshToken.findOne({ email });

	if (!refreshTokenColl) {
		return res.status(400).json({
			reason: "unauthorized",
			message: "Invalid token",
			success: false,
		});
	} else {
		const user = await User.findOne({ email: email }, "-password");
		let token = jwt.sign(
			{
				_id: user._id,
				fname: user.fname,
				lname: user.lname,
				email: user.email,
				level: user.level,
				verified: user.verified,
			},
			JWT_SECRET,
			{ expiresIn: "20s" }
		);
		return res.status(200).json({
			data: {
				...user._doc,
			},
			token,
			message: Login_MSG.loginSuccess,
			success: true,
		});
	}
};

const getuseradmin = async (req, res, next) => {
	let user;
	if (req.params.email) {
		const email = req.params.email;
		try {
			user = await User.findOne({ email: email }, "-password");
		} catch (err) {
			return new Error(err);
		}
	}
	if (!user) {
		return res.status(404).json({ message: "User not found!!" });
	}
	return res.status(200).json(user);
};

const logout = async (req, res, next) => {
	if (req.headers["authorization"]) {
		const cookies = req.headers["authorization"];
		try {
			token = cookies.split(" ")[1];
		} catch (err) {
			console.log(err);
		}
	} else {
		return res.status(400).json({
			reason: "unauthorized",
			message: "Session not found",
			success: false,
		});
	}

	if (!token) {
		return res.status(400).json({
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
			const refreshToken = req.body.refreshToken;

			RefreshToken.findOne({ refreshToken: refreshToken })
				.then((foundToken) => {
					if (!foundToken) {
						throw new Error("Invalid refreshToken");
					}

					console.log("the email is :- " + user.email);

					return RefreshToken.updateOne(
						{ email: user.email },
						{ $pull: { refreshToken: refreshToken } }
					);
				})
				.then((result) => {
					if (result.nModified === 0) {
						throw new Error("Failed to remove refreshToken");
					}

					console.log("Successfully removed the refreshToken from the array");
					return res.status(200).json({
						reason: "Logout",
						message: "Successfully Logged Out",
						success: false,
					});
				})
				.catch((err) => {
					console.error(err.message);
				});
		}
	});
};

const generate = async (req, res, next) => {
	const otp_len = 4;
	const auth_type = "acc_verify";
	let otp;
	const email = req.email;

	let auth = await Auth.findOne({ email, auth_type: auth_type });
	if (auth) {
		otp = auth.otp;
	} else {
		otp = otpgen(otp_len);
		auth = new Auth({
			email,
			username: email,
			auth_type,
			otp,
		});

		try {
			await auth.save();
		} catch (err) {
			console.log(err);
			return res.status(500).json({
				reason: "error",
				message: "Internal Server Error! Cannot generate OTP!",
				success: false,
			});
		}
	}
	try {
		console.log(otp);
		await mailer(
			email,
			"OTP for verification of FourGear Account",
			`Your OTP is:- ${otp}`,
			email,
			auth_type
		);
	} catch (err) {
		return res.status(500).json({
			reason: "server",
			message:
				"Internal Server Error! Cannot Send Mail. Please try again later!!",
			success: false,
		});
	}

	return res.status(200).json({
		message: "OTP Sent Successfully",
		success: true,
	});
};

const verifyUser = async (username, verified) => {
	let user = await User.findOne({ email: username });
	user.verified = verified;
	await user.save();
};

const verify = async (req, res, next) => {
	const auth_type = "acc_verify";
	const { otp } = req.body;
	const email = req.email || req.body.email;
	if (validateEmail(email)) {
		let auth = await Auth.findOne({ email, auth_type: auth_type });
		if (auth) {
			if (auth.otp === otp) {
				await verifyUser(email, true);
				await Auth.findByIdAndDelete(auth.id);
				return res.status(200).json({
					message: "Account verified successfully",
					success: true,
				});
			} else {
				return res.status(401).json({
					reason: "otp",
					message: "OTP is wrong",
					success: false,
				});
			}
		} else {
			return res.status(403).json({
				reason: "otp",
				message: "First generate otp then try verifying the account!",
				success: false,
			});
		}
	} else {
		return res.status(404).json({
			reason: "user",
			message: "User don't exist!",
			success: false,
		});
	}
};

module.exports = {
	login,
	register,
	verifytoken,
	refresh,
	getuser,
	getuseradmin,
	verifyRefreshToken,
	logout,
	generate,
	verify,
};
