import { Request, Response, NextFunction } from "express";
import { FurnitorService } from "../services/FurnitorService";

export class FurnitorController {
  private furnitorService: FurnitorService;

  constructor() {
    this.furnitorService = new FurnitorService();
  }

  listo = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.furnitorService.listoFurnitoret();
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  merr = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const furnitor = await this.furnitorService.merrFurnitor(id);
      if (!furnitor) {
        const err = new Error("Furnitori nuk u gjet");
        (err as any).statusCode = 404;
        throw err;
      }
      res.json(furnitor);
    } catch (err) {
      next(err);
    }
  };

  krijo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { emer } = req.body as { emer?: string };
      if (!emer) {
        const err = new Error("emer është i detyrueshëm");
        (err as any).statusCode = 400;
        throw err;
      }
      const furnitor = await this.furnitorService.krijoFurnitor(req.body);
      res.status(201).json(furnitor);
    } catch (err) {
      next(err);
    }
  };

  perditeso = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const furnitor = await this.furnitorService.perditesoFurnitor(id, req.body);
      res.json(furnitor);
    } catch (err) {
      next(err);
    }
  };

  fshi = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const deleted = await this.furnitorService.fshiFurnitor(id);
      res.json({ deleted });
    } catch (err) {
      next(err);
    }
  };
}