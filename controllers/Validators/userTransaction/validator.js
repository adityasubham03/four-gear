const Joi = require('joi');

const transactionSchema = Joi.object({
  date: Joi.date().required(),
  details: Joi.string().required(),
  amount: Joi.number().required(),
  partsReplaced: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      quantity: Joi.number().required(),
      price: Joi.number().required(),
    })
  ),
  user: Joi.string().required(),
});

module.exports = transactionSchema;