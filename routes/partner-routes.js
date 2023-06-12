const express = require('express');
const { register, get } = require('../controllers/Partners/partners-controllers');
const { verifytoken } = require('../controllers/Auth/auth');
const { saveTransaction } = require('../controllers/Partners/transactionCompleteController');



const router = express.Router();

router.post("/register", register);
router.get("/", get);
router.get("/:id", get);
// router.get("/:id/:date", verifytoken, dayWiseTransactionHistory);
router.get("/:id/saveTransaction", verifytoken, saveTransaction);
// router.get("/:partner-id/sendSMS", verifytoken, partnerSendSMS);


module.exports = router;
