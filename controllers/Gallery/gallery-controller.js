const { isValidObjectId } = require('mongoose');
const gallery = require('../../models/gallery');

const uploadgalleryimage = async (req, res, next) => {
	const image = req.body.image;
	if (!image) {
		return res.status(203).json({
			reason: "image",
			message: "No image found",
			success: false,
		});
    }
    const Gallery = new gallery({
        image,
    });
    await Gallery.save();
    return res.status(200).json({
        message: "Image uploaded successfully",
        success: true,
    });
};

const getgalleryimages = async (req, res, next) => {
    const images = await gallery.find();
    if (!images[0]) {
        return res.status(400).json({
			reason: "image",
			message: "No image found",
			success: false,
		});
    }
    return res.status(200).json({
        ...images,
        success: true,
    });
}

const deletegalleryimage = async (req, res, next) => {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
        return res.status(400).json({
			reason: "id",
			message: "Invalid id found",
			success: false,
		});
    }
    if (!id) {
        return res.status(400).json({
			reason: "id",
			message: "No id found",
			success: false,
		});
    }

    await gallery.findByIdAndDelete(id);
    return res.status(200).json({
        message: "Image deleted successfully",
        success: true,
    });
}


module.exports = {
    uploadgalleryimage,
    getgalleryimages,
    deletegalleryimage,
};