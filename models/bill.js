const { Schema, model } = require("mongoose");

const billSchema = new Schema(
	{
		phoneNumber: {
			type: String,
			required: true,
		},

		customerName: {
			type: String,
			required: true,
		},

		serviceId: {
			type: String,
			required: true,
		},

		bikeModel: {
			type: String,
			required: true,
		},

		products: [
			{
				description: {
					type: String,
					required: true,
				},
				price: {
					type: Number,
					required: true,
				},
			},
		],

		totalPrice: {
			type: Number,
			required: true,
		},
		paid: {
			type: Boolean,
			default: false,
		},
		billedBy: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

module.exports = model("bills", billSchema);
