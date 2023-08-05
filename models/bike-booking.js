const { Schema, model } = require("mongoose");

const BikeBookingSchema = new Schema({
	bookingDetails: {
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
	},
	address: {
		address: {
			type: String,
			required: true,
		},
		street: {
			type: String,
			required: true,
		},
		landmark: {
			type: String,
			required: true,
		},
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
	isAssigned: {
		type: Boolean,
		default: false,
	},
	assignedTo: {
		type: Number,
		default: null,
	},
	partnerName: {
		type: String,
		required: true,
	},
	isCompleted: {
		type: Boolean,
		default: false,
	},
	isAbandoned: {
		type: Boolean,
		default: false,
	},
	isBillGenerated: {
		type: Boolean,
		default: false,
	},
	billId: {
		type: String,
		default: null,
	},
	paid: {
		type: Boolean,
		default: false,
	},
});

module.exports = model("BikeBooking", BikeBookingSchema);
