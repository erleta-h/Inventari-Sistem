// modules/produkte/kategoria.validation.js
const Joi = require("joi");

const kategoriaSchema = Joi.object({
  emri: Joi.string().min(2).max(50).required(),
  pershkrimi: Joi.string().max(255).optional()
});

module.exports = { kategoriaSchema };
