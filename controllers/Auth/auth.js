const User = require("../../models/Users");
const RefreshToken = require("../../models/refreshToken");
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
("");
const Register_MSG = {
	usernameExists: "Username is already taken.",
	emailExists: "Email is already registered.",
	signupSuccess: "You are successfully signed up.",
	signupError: "Unable to create your account.",
};

let refreshTokensCollection = []

const register = async (req, res, next) => {
	try {
		const level = 1;
		const signupRequest = await signupSchema.validateAsync(req.body);

		let emailNotRegistered = await validateEmail(signupRequest.email);
		if (!emailNotRegistered) {
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
				},
				JWT_REFRESH_TOKEN_SECRET
			);

			if(!refreshTokenColl){
				const newRefreshTokenColl = new RefreshToken({
					email,
					refreshToken
				});
				newRefreshTokenColl.save();
			}

			if (refreshTokenColl) {
				RefreshToken.updateOne({ email: user.email }, { $push: { refreshToken: refreshToken } })
				  .then(result => {
					console.log('Successfully updated the refresh token');
				  })
				  .catch(err => {
					return res.status(404).json({
						reason: "email",
						message: "Cannot able To add the refresh token to the list of known refresh token",
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
			return res.status(200).json({
				reason: "password",
				message: Login_MSG.wrongPassword,
				success: false,
			});
		}
	} catch (err) {
		console.log
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
			req.fname = user.fname;
			req.lname = user.lname;
			req.email = user.email;
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
			req.fname = user.fname;
			req.lname = user.lname;
			req.email = user.email;
			req.level = user.level;
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
        let token = req.token
        r = {
            token,
            user
        }
    } else {
        r = user;
    }
	return res.status(200).json(r);
};

const refresh = async (req, res, next) => {
	let refreshTokenColl;
	var email = req.email;
	refreshTokenColl = await RefreshToken.findOne({ email });

	if(!refreshTokenColl){
		return res.status(400).json({
			reason: "unauthorized",
			message: "Invalid token",
			success: false,
		});
	} else {
		let token = jwt.sign(
			{
				_id: req._id,
				fname: req.fname,
				lname: req.lname,
				email: req.email,
				level: req.level,
			},
			JWT_SECRET,
			{ expiresIn: "20s" }
		);
		return res.status(200).json({
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
			user = await User.findOne({ email: email },"-password");
		} catch (err) {
			return new Error(err);
		}
	}
	if (!user) {
		return res.status(404).json({ message: "User not found!!" });
	}
	return res.status(200).json(user);
}

const logout = async (req, res, next) => {

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
  	.then(foundToken => {
    if (!foundToken) {
      throw new Error('Invalid refreshToken');
    }

	console.log('the email is :- '+user.email);

    return RefreshToken.updateOne(
      { email: user.email },
      { $pull: { refreshToken: refreshToken } }
    );
  })
  .then(result => {
    if (result.nModified === 0) {
      throw new Error('Failed to remove refreshToken');
    }

    console.log('Successfully removed the refreshToken from the array');
	return res.status(200).json({
		reason: "Logout",
		message: "Successfully Logged Out",
		success: false,
	});
  })
  .catch(err => {
    console.error(err.message);
  });
		}
	});
}


module.exports = {
	login,
	register,
	verifytoken,
    refresh,
    getuser,
    getuseradmin,
	verifyRefreshToken,
	logout
};