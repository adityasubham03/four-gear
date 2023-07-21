const express = require("express");
const {
	viewBooking,
	viewBookingUser,
} = require("../controllers/bike-service-booking/booking");
const { isadmin } = require("../controllers/Validators/Auth/validator");
const { verifytoken } = require("../controllers/Auth/auth");
// const { verifytoken } = require('../controllers/Partners/partners-controllers');

const router = express.Router();
//User route to view their previous services
router.get("/user/bike", verifytoken, viewBookingUser);

//Partner route to view their upcoming or older services

//Admin route to get all the bookings done through their portal
router.get("/admin/bike", verifytoken, isadmin, viewBooking);

module.exports = router;
