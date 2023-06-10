const express = require('express');
const { verifytoken } = require('../controllers/Auth/auth');
const { isadmin } = require('../controllers/Validators/Auth/validator');
const { uploadgalleryimage, getgalleryimages, deletegalleryimage } = require('../controllers/Gallery/gallery-controller');


const router = express.Router();

router.post("/upload", verifytoken, isadmin, uploadgalleryimage);
router.post("/delete/:id", deletegalleryimage);
router.get("/",getgalleryimages)

module.exports = router;
