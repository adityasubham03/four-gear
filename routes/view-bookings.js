const express = require('express');
const { viewBooking } = require('../controllers/bike-service-booking/booking');
const { isadmin } = require('../controllers/Validators/Auth/validator');
const { verifytoken } = require('../controllers/Auth/auth');
// const { verifytoken } = require('../controllers/Partners/partners-controllers');



const router = express.Router();
//User route to view their previous services
router.get("/admin/bike", verifytoken, viewBooking);

//Partner route to view their upcoming or older services
router.get("/partner/bike", verifytoken, viewBooking);

//Admin route to get all the bookings done through their portal
router.get("/admin/bike", verifytoken, isadmin, viewBooking);


module.exports = router;




