const Joi = require("joi");

const partnerRegisterSchema = Joi.object({
  name: Joi.string().min(1).required(),
  phone: Joi.number().min(10).required(),
  email: Joi.string().email(),
  password: Joi.string()
		.pattern(new RegExp("^[a-zA-Z0-9!@#$%^&*()_]{8,30}$"))
		.min(8)
    .required(),
  shopName: Joi.string().required(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  map: Joi.object({
		longitude: Joi.number().required(),
		latitude: Joi.number().required(),
	}).required(),
  adhaarNumber: Joi.number().required(),
  accountNumber: Joi.number().required(),
  IFSC: Joi.string().required(),
  ownerPic: Joi.string().required(),
  shopPic: Joi.string().required(),
  noMechanics: Joi.number().required(),
  mechanicDetails: Joi.array().items(
    Joi.object({
      name: Joi.string().min(1).required(),
      contact: Joi.number().min(10).required(),
      address: Joi.string().required(),
      photo: Joi.string().required(),
    })
  ),
});

const partnerloginSchema = Joi.object({
	phone: Joi.number().min(10).required(),
	password: Joi.string()
		.pattern(new RegExp("^[a-zA-Z0-9!@#$%^&*()_]{3,30}$"))
		.min(8)
		.required(),
});

module.exports = {
  partnerRegisterSchema,
  partnerloginSchema,
};
