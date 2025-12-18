import { Request, Response, NextFunction } from "express";
import { MjetTransportuesService } from "../services/MjetTransportuesService";

export class MjetTransportuesController {
  private mjetService: MjetTransportuesService;

  constructor() {
    this.mjetService = new MjetTransportuesService();
  }

  listo = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.mjetService.listoMjetet();
      res.json({ status: "success", data: data });
    } catch (err) {
      next(err);
    }
  };

  merr = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const mjet = await this.mjetService.merrMjet(id);
      if (!mjet) {
        const err = new Error("Mjeti nuk u gjet");
        (err as any).statusCode = 404;
        throw err;
      }
      res.json(mjet);
    } catch (err) {
      next(err);
    }
  };

  krijo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { targa } = req.body as { targa?: string };
      if (!targa) {
        const err = new Error("targa është e detyrueshme");
        (err as any).statusCode = 400;
        throw err;
      }
      const mjet = await this.mjetService.krijoMjet(req.body);
      res.status(201).json(mjet);
    } catch (err) {
      next(err);
    }
  };

  perditeso = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const mjet = await this.mjetService.perditesoMjet(id, req.body);
      res.json(mjet);
    } catch (err) {
      next(err);
    }
  };

  fshi = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const deleted = await this.mjetService.fshiMjet(id);
      res.json({ deleted });
    } catch (err) {
      next(err);
    }
  };
}