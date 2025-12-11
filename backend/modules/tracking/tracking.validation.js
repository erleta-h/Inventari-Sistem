const Joi = require("joi");

const trackingSchema = Joi.object({
  deliveryId: Joi.number().integer().required(),

  latitude: Joi.number().required(),

  longitude: Joi.number().required(),

  speed: Joi.number().allow(null),

  address: Joi.string().allow(null)
});

function validateTracking(req, res, next) {
  const { error } = trackingSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}

module.exports = {
  trackingSchema,
  validateTracking
};
