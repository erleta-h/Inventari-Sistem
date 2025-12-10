const Joi = require("joi");

const productSchema = Joi.object({
  emri: Joi.string().min(2).required(),

  kodi: Joi.string().min(2).required(), // unique code

  kategoria: Joi.string().min(2).required(),

  brendi: Joi.string().optional(),

  uniteti: Joi.string()
    .valid("cope", "pako", "liter", "kg", "rrolle", "bidon")
    .required(),

  pershkrimi: Joi.string().optional(),

  qmimi: Joi.number().positive().required(),
});

module.exports = { productSchema };
