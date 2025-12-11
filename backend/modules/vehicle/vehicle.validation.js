const Joi = require("joi");

const vehicleSchema = Joi.object({
  plateNumber: Joi.string().required(),

  type: Joi.string()
    .valid("CAR", "VAN", "TRUCK")
    .required(),

  capacity: Joi.number().integer().min(1).required(),

  status: Joi.string()
    .valid("Available", "InUse", "Maintenance")
    .default("Available"),

  fuelLevel: Joi.number().integer().min(0).max(100).allow(null),

  lastMaintenance: Joi.date().allow(null),

  isActive: Joi.boolean().default(true)
});

function validateVehicle(req, res, next) {
  const { error } = vehicleSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}

const vehicleStatusSchema = Joi.object({
  status: Joi.string()
    .valid("Available", "InUse", "Maintenance")
    .required()
});

function validateVehicleStatus(req, res, next) {
  const { error } = vehicleStatusSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}

module.exports = {
  vehicleSchema,
  validateVehicle,
  vehicleStatusSchema,
  validateVehicleStatus
};
