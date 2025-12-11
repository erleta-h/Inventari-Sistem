const Joi = require("joi");

const deliverySchema = Joi.object({
  orderId: Joi.number().integer().required(),

  driverId: Joi.number().integer().allow(null),

  vehicleId: Joi.number().integer().allow(null),

  status: Joi.string()
    .valid("PENDING", "ASSIGNED", "ON_THE_WAY", "DELIVERED", "FAILED")
    .default("PENDING"),

  currentLocation: Joi.string().allow(null),

  expectedDeliveryTime: Joi.date().allow(null),

  notes: Joi.string().allow(null)
});

function validateDelivery(req, res, next) {
  const { error } = deliverySchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}

module.exports = {
  deliverySchema,
  validateDelivery
};
