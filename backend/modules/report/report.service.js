const Report = require("./report.model.js");
const Delivery = require("../delivery/delivery.model.js");
const Vehicle = require("../vehicle/vehicle.model.js");
const Tracking = require("../tracking/tracking.model.js");
const NotificationService = require("../notification/notification.service.js");

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

class ReportService {
  constructor() {
    this.notificationService = new NotificationService();
  }

  // -------------------------
  //   GENERATE REPORTS
  // -------------------------

  async generateDeliveryReport(filters = null, createdBy = null) {
    const deliveries = await Delivery.findAll();

    const report = await Report.create({
      type: "DeliveryReport",
      data: { deliveries },
      createdBy,
      filters,
      status: "OK"
    });

    this.notificationService.sendSystemNotification(
      "A new DELIVERY REPORT has been generated."
    );

    return report;
  }

  async generateVehicleReport(filters = null, createdBy = null) {
    const vehicles = await Vehicle.findAll();

    const report = await Report.create({
      type: "VehicleReport",
      data: { vehicles },
      createdBy,
      filters,
      status: "OK"
    });

    this.notificationService.sendSystemNotification(
      "A new VEHICLE REPORT has been generated."
    );

    return report;
  }

  async generateTrackingReport(deliveryId, createdBy = null) {
    const trackingData = await Tracking.findAll({
      where: { deliveryId },
      order: [["timestamp", "ASC"]]
    });

    const report = await Report.create({
      type: "TrackingReport",
      data: { deliveryId, trackingData },
      createdBy,
      status: "OK"
    });

    this.notificationService.notifyDeliveryEvent(
      deliveryId,
      "A tracking report has been generated."
    );

    return report;
  }

  // -------------------------
  //      GET REPORTS
  // -------------------------

  async getAll() {
    return await Report.findAll({
      order: [["generatedAt", "DESC"]]
    });
  }

  async getById(id) {
    const report = await Report.findByPk(id);
    if (!report) throw new Error("Report not found");
    return report;
  }

  // -------------------------
  //      GENERATE PDF
  // -------------------------

  async generatePDF(report) {
    const doc = new PDFDocument({ margin: 40 });

    // Create uploads folder if not exists
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads");
    }

    const filePath = path.join("uploads", `report-${report.id}.pdf`);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Title
    doc.fontSize(22).text(`Raport: ${report.type}`, { align: "center" });
    doc.moveDown();

    // Date
    doc.fontSize(12).text(`Gjeneruar më: ${report.generatedAt}`);
    doc.moveDown();

    // Content
    doc.fontSize(14).text("Përmbajtja e raportit:", { underline: true });
    doc.moveDown();

    doc.fontSize(10).text(JSON.stringify(report.data, null, 2), {
      width: 450
    });

    doc.end();

    return filePath;
  }
}

module.exports = ReportService;
