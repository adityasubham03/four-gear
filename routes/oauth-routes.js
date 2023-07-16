const express = require('express');
const { googleOauthHandler } = require('../controllers/OAuth/oauth');




const router = express.Router();

router.get('/provider/google/:code', googleOauthHandler);


module.exports = router;
