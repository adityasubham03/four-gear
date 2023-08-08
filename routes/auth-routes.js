const express = require("express");
const {
	login,
	register,
	verifytoken,
	getuser,
	refresh,
	getuseradmin,
	verifyRefreshToken,
	logout,
	generate,
	verify,
	forget,
	forgetIsValid,
	forget_save,
} = require("../controllers/Auth/auth");
const {
	isadmin,
	verification,
	isOTP,
} = require("../controllers/Validators/Auth/validator");

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/generate", verifytoken, generate);
router.post("/verify", verifytoken, verification, isOTP, verify);
router.post("/register/verify", isOTP, verify);
router.get("/user", verifytoken, getuser);
router.get("/refresh", verifyRefreshToken, refresh);
router.get("/user/:email/", verifytoken, isadmin, getuseradmin);
router.post("/logout", verifytoken, logout);
router.post("/forget", forget);
router.get("/forget/:otp", forgetIsValid);
router.post("/forget/save", forget_save);

module.exports = router;
