import { Request, Response, NextFunction } from "express";
import { InventoryService } from "../services/InventoryService";

export class InventarController {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  listo = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.inventoryService.merrInventarin();
      res.json({
        status: "success",
        data: data,
      });
    } catch (err) {
      next(err);
    }
  };

  pranoMallin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { depo_id, produkt_id, sasia, furnitor_id, furnitor_emer } = req.body as {
        depo_id?: number;
        produkt_id?: number;
        sasia?: number;
        furnitor_id?: number;
        furnitor_emer?: string;
      };

      if (!depo_id || !produkt_id || !sasia) {
        const err = new Error("depo_id, produkt_id, sasia janë të detyrueshme");
        (err as any).statusCode = 400;
        throw err;
      }

      if (!req.auth?.id) {
        const err = new Error("Nuk jeni të autentifikuar");
        (err as any).statusCode = 401;
        throw err;
      }

      const data = await this.inventoryService.pranoMallin(
        depo_id,
        produkt_id,
        sasia,
        req.auth.id,
        furnitor_id,
        furnitor_emer
      );
      res.status(201).json({
        status: "success",
        data: data,
      });
    } catch (err) {
      next(err);
    }
  };

  perditesoStok = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { depo_id, produkt_id, sasia } = req.body as {
        depo_id?: number;
        produkt_id?: number;
        sasia?: number;
      };

      if (!depo_id || !produkt_id || sasia === undefined) {
        const err = new Error("depo_id, produkt_id, sasia janë të detyrueshme");
        (err as any).statusCode = 400;
        throw err;
      }

      if (!req.auth?.id) {
        const err = new Error("Nuk jeni të autentifikuar");
        (err as any).statusCode = 401;
        throw err;
      }

      const data = await this.inventoryService.perditesimStok(
        depo_id,
        produkt_id,
        sasia,
        req.auth.id
      );
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  transfero = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { produkt_id, from_depo_id, to_depo_id, sasia } = req.body as {
        produkt_id?: number;
        from_depo_id?: number;
        to_depo_id?: number;
        sasia?: number;
      };

      if (!produkt_id || !from_depo_id || !to_depo_id || !sasia) {
        const err = new Error(
          "produkt_id, from_depo_id, to_depo_id, sasia janë të detyrueshme"
        );
        (err as any).statusCode = 400;
        throw err;
      }

      if (!req.auth?.id) {
        const err = new Error("Nuk jeni të autentifikuar");
        (err as any).statusCode = 401;
        throw err;
      }

      const data = await this.inventoryService.transferoProdukte(
        produkt_id,
        from_depo_id,
        to_depo_id,
        sasia,
        req.auth.id
      );
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  };

  stokMinimal = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.inventoryService.gjejProdukteMeStokMinimal();
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  listoTransferet = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.inventoryService.merrTransferet();
      res.json({
        status: "success",
        data: data,
      });
    } catch (err) {
      next(err);
    }
  };

  gjejDepoMeStok = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { produkt_id, sasia } = req.query as {
        produkt_id?: string;
        sasia?: string;
      };

      if (!produkt_id) {
        const err = new Error("produkt_id është i detyrueshëm");
        (err as any).statusCode = 400;
        throw err;
      }

      const sasiaMinimale = sasia ? Number(sasia) : 0;
      const data = await this.inventoryService.gjejDepoMeStokPerProdukt(
        Number(produkt_id),
        sasiaMinimale
      );
      res.json({
        status: "success",
        data: data,
      });
    } catch (err) {
      next(err);
    }
  };
}