const express = require("express");
const {
	register,
	get,
	login,
	getuser,
	verifytoken,
    verifyRefreshToken,
	refresh,
	service,
} = require("../controllers/Partners/partners-controllers");
const {
	saveTransaction,
	dayWiseTransactionHistory,
	confirmBooking,
	declineBooking,
	sendUserSms,
	sendPartnerSms,
	notify,
} = require("../controllers/Partners/transactionCompleteController");
const { generateBill } = require("../controllers/Partners/bill-generator");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get( "/user", verifytoken,getuser);
router.get("/refresh", verifyRefreshToken, refresh);
// router.get("/", get);
// router.get("/", get);
// router.get("/:id", get);
router.get("/service", verifytoken, service);
router.post("/")

// router.get("/:id/:date", verifytoken, dayWiseTransactionHistory);
router.get("/:id/saveTransaction", verifytoken, saveTransaction);
router.post("/confirm", verifytoken, confirmBooking);
router.post("/decline", verifytoken, declineBooking);
router.post("/generatebill", verifytoken, generateBill);
router.get("/bill/:billid", verifytoken);
router.get("/sendUserSms/:bookingid", verifytoken, sendUserSms);
router.get("/sendPartnerSms/:bookingid", verifytoken, sendPartnerSms);
router.get("/notify", verifytoken, notify);


module.exports = router;
