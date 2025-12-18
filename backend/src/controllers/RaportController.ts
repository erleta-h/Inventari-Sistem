import { Request, Response, NextFunction } from "express";
import { ReportingService } from "../services/ReportingService";

export class RaportController {
  private reportingService: ReportingService;

  constructor() {
    this.reportingService = new ReportingService();
  }

  inventar = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.reportingService.gjeneroRaportInventari();
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  performance = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.reportingService.gjeneroRaportPerformancës();
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  furnitore = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.reportingService.gjeneroRaportFurnitorësh();
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  financiar = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.reportingService.gjeneroRaportFinanciar();
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}




