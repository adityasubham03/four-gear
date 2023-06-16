const express = require('express');
const { register, get } = require('../controllers/Partners/partners-controllers');
const { verifytoken } = require('../controllers/Auth/auth');
const { saveTransaction, dayWiseTransactionHistory, confirmBooking, sendUserSms, sendPartnerSms, notify } = require('../controllers/Partners/transactionCompleteController');



const router = express.Router();

router.post("/register", register);
router.get("/", get);
router.get("/:id", get);
// router.get("/:id/:date", verifytoken, dayWiseTransactionHistory);
router.get("/:id/saveTransaction", verifytoken, saveTransaction);
router.get("/confirm", verifytoken, confirmBooking);
router.get("/sendUserSms/:bookingid", verifytoken, sendUserSms);
router.get("/sendPartnerSms/:bookingid", verifytoken, sendPartnerSms);
router.get("/notify", verifytoken, notify);

module.exports = router;
