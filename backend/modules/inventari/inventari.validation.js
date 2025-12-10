const Joi = require("joi");

const inventorySchema = Joi.object({
  produktiId: Joi.number().required(),
  depoId: Joi.number().required(),

  sasia: Joi.number().min(0).required(),
  minimum_sasia: Joi.number().min(0).required(),

  brendi: Joi.string().optional(),
  uniteti: Joi.string().valid("cope", "paket", "kg", "l").default("cope"),

  statusi: Joi.string().valid("aktive", "nen_minimum", "mbaruar").default("aktive")
});

module.exports = { inventorySchema };
