const { Schema, model } = require("mongoose");

const BikeBookingSchema = new Schema({
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
	servicedBy: {
		type: String,
	},
	bike_Company: {
		type: String,
		required: true,
	},
	bike_Model: {
		type: String,
		required: true,
	},
	address: {
		type: String,
		required: true,
	},
	isConfirmed: {
		type: Boolean,
		default: false,
	},
	map: {
		longitude: {
			type: Number,
			required: true,
		},
		latitude: {
			type: Number,
			required: true,
		},
	},
	distances: [
		{
			phone: {
				type: Number,
				required: true,
			},
			distance: {
				type: Number,
				required: true,
			},
		},
	],
	current: {
		type: Number,
		default: 0,
	},
});

module.exports = model("BikeBooking", BikeBookingSchema);
