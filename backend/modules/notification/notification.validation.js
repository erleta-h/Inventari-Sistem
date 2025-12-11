const Joi = require("joi");

const notificationSchema = Joi.object({
  type: Joi.string()
    .valid("System", "User", "DeliveryAlert", "VehicleAlert", "ReportAlert")
    .required(),

  message: Joi.string().required(),

  recipient: Joi.number().integer().allow(null),

  isRead: Joi.boolean().default(false),

  priority: Joi.string()
    .valid("LOW", "MEDIUM", "HIGH")
    .default("LOW"),

  relatedId: Joi.number().integer().allow(null),

  relatedModule: Joi.string()
    .valid("Delivery", "Vehicle", "Tracking", "Report")
    .allow(null)
});

function validateNotification(req, res, next) {
  const { error } = notificationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}

module.exports = {
  notificationSchema,
  validateNotification
};
