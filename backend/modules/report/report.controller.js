const ReportService = require("./report.service.js");

class ReportController {
  constructor() {
    this.reportService = new ReportService();
  }

  generateDeliveryReport = async (req, res) => {
    try {
      const { filters, createdBy } = req.body;
      const report = await this.reportService.generateDeliveryReport(filters, createdBy);
      res.status(201).json(report);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  generateVehicleReport = async (req, res) => {
    try {
      const { filters, createdBy } = req.body;
      const report = await this.reportService.generateVehicleReport(filters, createdBy);
      res.status(201).json(report);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  generateTrackingReport = async (req, res) => {
    try {
      const report = await this.reportService.generateTrackingReport(
        req.params.deliveryId,
        req.body.createdBy
      );
      res.status(201).json(report);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  getAll = async (req, res) => {
    try {
      const reports = await this.reportService.getAll();
      res.json(reports);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  getById = async (req, res) => {
    try {
      const report = await this.reportService.getById(req.params.id);
      res.json(report);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  downloadPDF = async (req, res) => {
    try {
      const report = await this.reportService.getById(req.params.id);
      const filePath = await this.reportService.generatePDF(report);

      res.download(filePath, `report-${report.id}.pdf`);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
}

module.exports = ReportController;
