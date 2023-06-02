const express = require('express');
const { book } = require('../controllers/bike-service-booking/booking');



const router = express.Router();

router.post("/bike",book);


module.exports = router;
