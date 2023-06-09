const express = require('express');
const { login, register, verifytoken, getuser, refresh, getuseradmin, verifyRefreshToken, logout } = require('../controllers/Auth/auth');
const { isadmin } = require('../controllers/Validators/Auth/validator');


const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/user", verifytoken, getuser);
router.get("/refresh",  verifyRefreshToken, refresh);
router.get("/user/:email/", verifytoken, isadmin, getuseradmin);
router.post("/logout", verifytoken, logout)

module.exports = router;
