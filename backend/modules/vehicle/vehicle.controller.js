const VehicleService = require("./vehicle.service.js");

class VehicleController {
  constructor() {
    this.vehicleService = new VehicleService();
  }

  create = async (req, res) => {
    try {
      const result = await this.vehicleService.create(req.body);
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  getAll = async (req, res) => {
    try {
      const result = await this.vehicleService.getAll();
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  getById = async (req, res) => {
    try {
      const result = await this.vehicleService.getById(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  update = async (req, res) => {
    try {
      const result = await this.vehicleService.update(req.params.id, req.body);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  delete = async (req, res) => {
    try {
      const result = await this.vehicleService.delete(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  setStatus = async (req, res) => {
    try {
      const { status } = req.body;
      const result = await this.vehicleService.setStatus(req.params.id, status);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
}

module.exports = VehicleController;
