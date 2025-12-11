// modules/produkte/njesiaMatese.validation.js
const Joi = require("joi");

const njesiaSchema = Joi.object({
  emri: Joi.string().min(1).max(50).required(),
  shkurtesa: Joi.string().min(1).max(10).required()
});

module.exports = { njesiaSchema };
