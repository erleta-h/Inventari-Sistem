const DeliveryService = require("./delivery.service.js");

class DeliveryController {
  constructor() {
    this.deliveryService = new DeliveryService();

    // Bind methods
    this.create = this.create.bind(this);
  //  this.assignDriver = this.assignDriver.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.markAsFailed = this.markAsFailed.bind(this);
    this.saveLocation = this.saveLocation.bind(this);
    this.getTracking = this.getTracking.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
  }

  create = async (req, res) => {
    try {
      const result = await this.deliveryService.create(req.body);
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  assignDriver = async (req, res) => {
    try {
      const { /*driverId,*/vehicleId } = req.body;
      const result = await this.deliveryService.assignDriver(
        req.params.id,
       // driverId,
        vehicleId
      );
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  updateStatus = async (req, res) => {
    try {
      const result = await this.deliveryService.updateStatus(
        req.params.id,
        req.body.status
      );
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  markAsFailed = async (req, res) => {
    try {
      const result = await this.deliveryService.markAsFailed(
        req.params.id,
        req.body.reason
      );
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  saveLocation = async (req, res) => {
    try {
      const { lat, lng, speed, address } = req.body;
      const result = await this.deliveryService.saveLocation(
        req.params.id,
        lat,
        lng,
        speed,
        address
      );
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  getTracking = async (req, res) => {
    try {
      const result = await this.deliveryService.getTracking(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  getAll = async (req, res) => {
    try {
      const deliveries = await this.deliveryService.getAll();
      res.json(deliveries);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  getById = async (req, res) => {
    try {
      const delivery = await this.deliveryService.getById(req.params.id);
      res.json(delivery);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
}

module.exports = DeliveryController;
