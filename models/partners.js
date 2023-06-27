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
		shopName: {
			type: String,
			required: true,
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
		aadharNumber: {
			type: Number,
			required: true,
		},
		accountNumber: {
			type: Number,
			required: true,
		},
		ifscCode: {
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
		numberofMechanics: {
			type: Number,
			required: true,
		},
		mechanicDetails: [
			{
				name: {
					type: String,
					required: true,
				},
				contactNumber: {
					type: Number,
					required: true,
				},
				address: {
					type: String,
					required: true,
				},
				aadharNumber: {
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
