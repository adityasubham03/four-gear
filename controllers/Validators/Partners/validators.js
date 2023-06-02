const Joi = require("joi");

const partnerRegisterSchema = Joi.object({
  name: Joi.string().min(1).required(),
  phone: Joi.number().min(10).required(),
  email: Joi.string().email(),
  address: Joi.string().required(),
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

module.exports = {
  partnerRegisterSchema,
};
