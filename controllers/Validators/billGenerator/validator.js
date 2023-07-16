const Joi = require("joi");

const billSchema = Joi.object({
	serviceId: Joi.string().required(),
	products: Joi.array()
		.items(
			Joi.object({
				description: Joi.string().required(),
				price: Joi.number().required(),
			})
		)
		.required(),
	totalPrice: Joi.number().required(),
});

module.exports = {
	billSchema,
};
