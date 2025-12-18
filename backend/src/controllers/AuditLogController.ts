import { Request, Response, NextFunction } from "express";
import { AuditLogService } from "../services/AuditLogService";

export class AuditLogController {
  private auditLogService: AuditLogService;

  constructor() {
    this.auditLogService = new AuditLogService();
  }

  listo = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.auditLogService.listoAuditLogs();
      res.json(data);
    } catch (err) {
      next(err);
    }
  };
}







