import { Request, Response, NextFunction } from "express";
import { SupplyService } from "../services/SupplyService";

export class PorosiFurnizimiController {
  private supplyService: SupplyService;

  constructor() {
    this.supplyService = new SupplyService();
  }

  listo = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.supplyService.listoPorositeFurnizimi();
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  merr = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const porosi = await this.supplyService.merrPorosiFurnizimi(id);
      if (!porosi) {
        const err = new Error("Porosia e furnizimit nuk u gjet");
        (err as any).statusCode = 404;
        throw err;
      }
      res.json(porosi);
    } catch (err) {
      next(err);
    }
  };

  krijo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth?.id) {
        const err = new Error("Nuk jeni të autentifikuar");
        (err as any).statusCode = 401;
        throw err;
      }

      const { furnitor_id, depo_id, artikujt } = req.body as {
        furnitor_id?: number;
        depo_id?: number;
        artikujt?: unknown;
      };

      if (!furnitor_id || !depo_id || !Array.isArray(artikujt) || artikujt.length === 0) {
        const err = new Error("furnitor_id, depo_id, artikujt janë të detyrueshme");
        (err as any).statusCode = 400;
        throw err;
      }

      const porosi = await this.supplyService.krijimPorosiFurnizimi({
        ...req.body,
        created_by: req.auth.id,
      });

      res.status(201).json(porosi);
    } catch (err) {
      next(err);
    }
  };

  pranoMallin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth?.id) {
        const err = new Error("Nuk jeni të autentifikuar");
        (err as any).statusCode = 401;
        throw err;
      }

      const id = Number(req.params.id);
      const { artikujt } = req.body as {
        artikujt?: { produkt_id: number; sasia_pranuar: number }[];
      };

      if (!Array.isArray(artikujt) || artikujt.length === 0) {
        const err = new Error("artikujt janë të detyrueshme");
        (err as any).statusCode = 400;
        throw err;
      }

      const porosi = await this.supplyService.pranoMallin(id, artikujt, req.auth.id);
      res.json(porosi);
    } catch (err) {
      next(err);
    }
  };
}