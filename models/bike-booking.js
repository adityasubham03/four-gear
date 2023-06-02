const { Schema, model } = require("mongoose");

const BikeBookingSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		phone: {
			type: Number,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		city: {
			type: String,
			required: true,
        },
        bike_Company: {
			type: String,
			required: true,
        },
        bike_Model: {
            type: String,
            required: true,
        },
	},
	{ timestamps: true }
);

module.exports = model("BikeBooking", BikeBookingSchema);
