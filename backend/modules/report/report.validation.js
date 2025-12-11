const Joi = require("joi");

const reportSchema = Joi.object({
  type: Joi.string()
    .valid("DeliveryReport", "VehicleReport", "TrackingReport")
    .required(),

  data: Joi.object().required(),

  createdBy: Joi.number().integer().allow(null),

  filters: Joi.object().allow(null),

  periodStart: Joi.date().allow(null),

  periodEnd: Joi.date().allow(null),

  status: Joi.string()
    .valid("OK", "ERROR")
    .default("OK")
});

function validateReport(req, res, next) {
  const { error } = reportSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}

module.exports = {
  reportSchema,
  validateReport
};
