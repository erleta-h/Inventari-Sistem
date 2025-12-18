import { Request, Response, NextFunction } from "express";
import { DeliveryService } from "../services/DeliveryService";
import { DergeseStatus } from "../models/Dergese";

export class DergeseController {
  private deliveryService: DeliveryService;

  constructor() {
    this.deliveryService = new DeliveryService();
  }

  listo = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.deliveryService.listoDergesat();
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  listoTeMiats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth?.id) {
        const err = new Error("Nuk jeni të autentifikuar");
        (err as any).statusCode = 401;
        throw err;
      }
      const { vetem_sot } = req.query as { vetem_sot?: string };
      const vetemSot = vetem_sot === 'true';
      const data = await this.deliveryService.gjejDergesatPerShofer(req.auth.id, vetemSot);
      res.json({
        status: "success",
        data: data,
      });
    } catch (err) {
      next(err);
    }
  };

  krijo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { porosi_id } = req.body as { porosi_id?: number };
      if (!porosi_id) {
        const err = new Error("porosi_id është i detyrueshëm");
        (err as any).statusCode = 400;
        throw err;
      }
      const data = await this.deliveryService.krijimDergese(porosi_id);
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  };

  caktoShofer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const { shofer_id, mjet_id } = req.body as {
        shofer_id?: number;
        mjet_id?: number;
      };
      if (!shofer_id || !mjet_id) {
        const err = new Error("shofer_id dhe mjet_id janë të detyrueshme");
        (err as any).statusCode = 400;
        throw err;
      }
      const data = await this.deliveryService.caktoShofer(id, shofer_id, mjet_id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  perditesoStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const { status, arsye_deshtimi } = req.body as {
        status?: DergeseStatus;
        arsye_deshtimi?: string;
      };
      if (!status) {
        const err = new Error("status është i detyrueshëm");
        (err as any).statusCode = 400;
        throw err;
      }
      const data = await this.deliveryService.perditesimStatusDergese(
        id,
        status,
        arsye_deshtimi
      );
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  perditesoPozicion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const { lat, lng } = req.body as { lat?: number; lng?: number };
      if (lat === undefined || lng === undefined) {
        const err = new Error("lat dhe lng janë të detyrueshme");
        (err as any).statusCode = 400;
        throw err;
      }
      const data = await this.deliveryService.perditesimPozicion(id, lat, lng);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  gjurmo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const data = await this.deliveryService.gjurmoDergese(id);
      if (!data) {
        const err = new Error("Dërgesa nuk u gjet");
        (err as any).statusCode = 404;
        throw err;
      }
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  shoferetEDisponueshem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit } = req.query as { limit?: string };
      const limitDergesat = limit ? Number(limit) : 5;
      const shoferetTeZene = await this.deliveryService.gjejShoferetEDisponueshem(limitDergesat);
      res.json({
        status: "success",
        data: {
          shoferet_te_zene: shoferetTeZene,
          limit: limitDergesat,
        },
      });
    } catch (err) {
      next(err);
    }
  };
}




