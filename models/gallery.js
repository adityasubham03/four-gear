const { Schema, model } = require("mongoose");

const GallerySchema = new Schema(
	{
        image: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

module.exports = model("Gallery", GallerySchema);
