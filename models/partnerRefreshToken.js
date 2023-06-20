const { Schema, model } = require("mongoose");

const partnerRefreshTokenSchema = new Schema(
	{
		phone: {
			type: Number,
			required: true,
		},
		refreshToken: {
			type: [String],
			required: true,
		},
	},
	{ timestamps: true }
);

module.exports = model("partnerRefreshToken", partnerRefreshTokenSchema);