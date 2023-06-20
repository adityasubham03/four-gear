const { Schema, model } = require("mongoose");

const PartnerSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		phone: {
			type: Number,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		email: {
			type: String,
		},
		address: {
			type: String,
			required: true,
		},
		city: {
			type: String,
			required: true,
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
		adhaarNumber: {
			type: Number,
			required: true,
		},
		accountNumber: {
			type: Number,
			required: true,
		},
		IFSC: {
			type: String,
			required: true,
		},
		ownerPic: {
			type: String,
			required: true,
		},
		shopPic: {
			type: String,
			required: true,
		},
		noMechanics: {
			type: Number,
			required: true,
		},
		mechanicDetails: [
			{
				name: {
					type: String,
					required: true,
				},
				contact: {
					type: Number,
					required: true,
				},
				address: {
					type: String,
					required: true,
				},
				photo: {
					type: String,
					required: true,
				},
			},
		],
		level: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true }
);

module.exports = model("Partners", PartnerSchema);
