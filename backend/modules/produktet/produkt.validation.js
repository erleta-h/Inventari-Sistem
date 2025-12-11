const Joi = require("joi");

const productSchema = Joi.object({
  emri: Joi.string().min(2).required(),
  kodi: Joi.string().min(2).required(),
  brendi: Joi.string().optional(),
  uniteti: Joi.string()
    .valid("cope", "pako", "liter", "kg", "rrolle", "bidon")
    .required(),
  pershkrimi: Joi.string().optional(),
  qmimi: Joi.number().positive().required(),
  KategoriaID: Joi.number().integer().required(),
  ID_Njesia: Joi.number().integer().required()
});

module.exports = { productSchema };
