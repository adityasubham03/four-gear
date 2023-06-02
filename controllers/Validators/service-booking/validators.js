const Joi = require("joi");

const bikeServiceBookingSchema = Joi.object({
	name: Joi.string().min(1).required(),
	phone: Joi.number().min(10).required(),
	email: Joi.string().email().required(),
    city: Joi.string().required(),
    bike_Company: Joi.string().required(),
	bike_Model: Joi.string().required(),
	
});

module.exports = {
	bikeServiceBookingSchema,
};
