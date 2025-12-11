const Tracking = require("./tracking.model.js");

class TrackingService {
  constructor(trackingRepository) {
    this.trackingRepository = trackingRepository;
  }

  async saveLocation(deliveryId, lat, lng) {
    return await this.trackingRepository.saveLocation(deliveryId, lat, lng);
  }

  async getTracking(deliveryId) {
    return await this.trackingRepository.getTracking(deliveryId);
  }
}

module.exports = TrackingService;
