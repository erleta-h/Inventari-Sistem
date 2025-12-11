const TrackingService = require("./tracking.service.js");

class TrackingController {
  constructor() {
    this.trackingService = new TrackingService();
  }

  saveLocation = async (req, res) => {
    try {
      const { lat, lng, speed, address } = req.body;
      const { id } = req.params;

      const record = await this.trackingService.saveLocation(
        id,
        lat,
        lng,
        speed,
        address
      );

      res.status(201).json(record);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  getTracking = async (req, res) => {
    try {
      const { id } = req.params;

      const trackingData = await this.trackingService.getTracking(id);
      res.json(trackingData);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  getLatest = async (req, res) => {
    try {
      const { id } = req.params;

      const record = await this.trackingService.getLatest(id);
      res.json(record);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
}

module.exports = TrackingController;
