const express = require('express');
const { viewBooking } = require('../controllers/bike-service-booking/booking');
const { isadmin } = require('../controllers/Validators/Auth/validator');
const { verifytoken } = require('../controllers/Auth/auth');



const router = express.Router();

router.get("/bike", verifytoken, isadmin, viewBooking);


module.exports = router;




