import { Request, Response, NextFunction } from "express";
import { ProduktService } from "../services/ProduktService";

export class ProduktController {
  private produktService: ProduktService;

  constructor() {
    this.produktService = new ProduktService();
  }

  listo = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.produktService.listoProduktet();
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
      const produkt = await this.produktService.merrProdukt(id);
      if (!produkt) {
        const err = new Error("Produkti nuk u gjet");
        (err as any).statusCode = 404;
        throw err;
      }
      res.json({
        status: "success",
        data: produkt,
      });
    } catch (err) {
      next(err);
    }
  };

  krijo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { emer, sku, cmimi_njesi } = req.body as {
        emer?: string;
        sku?: string;
        cmimi_njesi?: number;
      };

      if (!emer || !sku || cmimi_njesi === undefined) {
        const err = new Error("emer, sku, cmimi_njesi janë të detyrueshme");
        (err as any).statusCode = 400;
        throw err;
      }

      const produkt = await this.produktService.krijoProdukt(req.body);
      res.status(201).json({
        status: "success",
        data: produkt,
      });
    } catch (err) {
      next(err);
    }
  };

  perditeso = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const produkt = await this.produktService.perditesoProdukt(id, req.body);
      res.json({
        status: "success",
        data: produkt,
      });
    } catch (err) {
      next(err);
    }
  };

  fshi = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const deleted = await this.produktService.fshiProdukt(id);
      res.json({
        status: "success",
        message: "Produkti u fshi me sukses",
        data: { deleted },
      });
    } catch (err) {
      next(err);
    }
  };
}