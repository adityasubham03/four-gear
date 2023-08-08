const { Schema, model } = require("mongoose");

const BookingHistory = new Schema(
	{
		customerId: {
			type: String,
			required: true,
		},
		PartnerId: {
			type: Number,
			required: true,
		},
		bookingId: {
			type: [String],
			required: true,
		},
	},
);

module.exports = model("bookingHistory", BookingHistory);
