const express = require('express');
const { register, get } = require('../controllers/Partners/partners-controllers');



const router = express.Router();

router.post("/register", register);
router.get("/", get);
router.get("/:id", get);


module.exports = router;
