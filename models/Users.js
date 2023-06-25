const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
	{
		fname: {
			type: String,
			required: true,
		},
		lname: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		phone: {
			type: Number,
			required: false,
		},
		password: {
			type: String,
			required: true,
        },
        level: {
			type: Number,
			default: 1,
		},
		verified: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

module.exports = model("Users", UserSchema);
