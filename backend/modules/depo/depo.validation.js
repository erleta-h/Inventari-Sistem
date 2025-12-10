const Joi = require("joi");

const depoSchema = Joi.object({
  emri: Joi.string().min(2).required(),
  lokacioni: Joi.string().min(2).required(),
  kapaciteti: Joi.number().min(0).optional(),
  pershkrimi: Joi.string().allow("").optional(),
  statusi: Joi.string().valid("aktiv", "jo_aktiv").default("aktiv")
});

module.exports = { depoSchema };
