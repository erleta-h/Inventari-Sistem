import { Request, Response, NextFunction } from "express";
import { DepoService } from "../services/DepoService";

export class DepoController {
  private depoService: DepoService;

  constructor() {
    this.depoService = new DepoService();
  }

  listo = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.depoService.listoDepot();
      res.json({
        status: "success",
        data: data,
      });
    } catch (err) {
      next(err);
    }
  };

  merr = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const depo = await this.depoService.merrDepo(id);
      if (!depo) {
        const err = new Error("Depoja nuk u gjet");
        (err as any).statusCode = 404;
        throw err;
      }
      res.json(depo);
    } catch (err) {
      next(err);
    }
  };

  krijo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { emer, kod } = req.body as { emer?: string; kod?: string };
      if (!emer || !kod) {
        const err = new Error("emer dhe kod janë të detyrueshme");
        (err as any).statusCode = 400;
        throw err;
      }
      const depo = await this.depoService.krijoDepo(req.body);
      res.status(201).json(depo);
    } catch (err) {
      next(err);
    }
  };

  perditeso = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const depo = await this.depoService.perditesoDepo(id, req.body);
      res.json(depo);
    } catch (err) {
      next(err);
    }
  };

  fshi = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const deleted = await this.depoService.fshiDepo(id);
      res.json({ deleted });
    } catch (err) {
      next(err);
    }
  };
}