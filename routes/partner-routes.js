const express = require("express");
const {
	register,
	get,
	login,
	getuser,
	verifytoken,
    verifyRefreshToken,
    refresh,
} = require("../controllers/Partners/partners-controllers");
const {
	saveTransaction,
	dayWiseTransactionHistory,
	confirmBooking,
	sendUserSms,
	sendPartnerSms,
	notify,
} = require("../controllers/Partners/transactionCompleteController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/user", verifytoken,getuser);
router.get("/refresh", verifyRefreshToken, refresh);
router.get("/", get);
router.get("/:id", get);


// router.get("/:id/:date", verifytoken, dayWiseTransactionHistory);
router.get("/:id/saveTransaction", verifytoken, saveTransaction);
router.get("/confirm", verifytoken, confirmBooking);
router.get("/sendUserSms/:bookingid", verifytoken, sendUserSms);
router.get("/sendPartnerSms/:bookingid", verifytoken, sendPartnerSms);
router.get("/notify", verifytoken, notify);


module.exports = router;
