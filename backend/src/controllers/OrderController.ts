import { Request, Response, NextFunction } from "express";
import { OrderService } from "../services/OrderService";
import { PorosiStatus } from "../models/Porosi";

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  krijimPorosi = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth?.id) {
        const err = new Error("Nuk jeni të autentifikuar");
        (err as any).statusCode = 401;
        throw err;
      }

      const { klient_id, depo_id, artikujt, adresa_dergeses, qyteti, shteti, parapagesa } = req.body as {
        klient_id?: number | string;
        depo_id?: number | string;
        artikujt?: Array<{ produkt_id: number | string; sasia: number | string }>;
        adresa_dergeses?: string;
        qyteti?: string;
        shteti?: string;
        parapagesa?: number | string;
      };

      const klientId = Number(klient_id);
      if (!klient_id || isNaN(klientId) || klientId <= 0) {
        const err = new Error("klient_id duhet të jetë një numër pozitiv");
        (err as any).statusCode = 400;
        throw err;
      }

      const depoId = Number(depo_id);
      if (!depo_id || isNaN(depoId) || depoId <= 0) {
        const err = new Error("depo_id duhet të jetë një numër pozitiv");
        (err as any).statusCode = 400;
        throw err;
      }

      if (!Array.isArray(artikujt) || artikujt.length === 0) {
        const err = new Error("artikujt duhet të jetë një array me të paktën një artikull");
        (err as any).statusCode = 400;
        throw err;
      }

      const artikujtNormalized = artikujt.map((a, idx) => {
        const produktId = Number(a.produkt_id);
        const sasia = Number(a.sasia);
        if (isNaN(produktId) || produktId <= 0) {
          const err = new Error(`Artikulli në pozicion ${idx} nuk ka produkt_id të vlefshëm`);
          (err as any).statusCode = 400;
          throw err;
        }
        if (isNaN(sasia) || sasia <= 0) {
          const err = new Error(`Artikulli në pozicion ${idx} nuk ka sasi të vlefshme`);
          (err as any).statusCode = 400;
          throw err;
        }
        return { produkt_id: produktId, sasia };
      });

      const porosi = await this.orderService.krijimPorosi({
        klient_id: klientId,
        depo_id: depoId,
        artikujt: artikujtNormalized,
        adresa_dergeses: adresa_dergeses || undefined,
        qyteti: qyteti || undefined,
        shteti: shteti || undefined,
        parapagesa: parapagesa !== undefined ? Number(parapagesa) : undefined,
        created_by: req.auth.id,
      });

      res.status(201).json({
        status: "success",
        data: porosi,
      });
    } catch (err) {
      next(err);
    }
  };

  listoPorosite = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.orderService.listoPorosite();
      res.json({
        status: "success",
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  gjejPorosi = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        const err = new Error("id nuk është i vlefshëm");
        (err as any).statusCode = 400;
        throw err;
      }

      const porosi = await this.orderService.merrPorosi(id);
      if (!porosi) {
        const err = new Error("Porosia nuk u gjet");
        (err as any).statusCode = 404;
        throw err;
      }

      res.json({
        status: "success",
        data: porosi,
      });
    } catch (err) {
      next(err);
    }
  };

  perditesimPorosi = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        const err = new Error("id nuk është i vlefshëm");
        (err as any).statusCode = 400;
        throw err;
      }

      const { status, adresa_dergeses, qyteti, shteti, shuma_paguar } = req.body as {
        status?: PorosiStatus;
        adresa_dergeses?: string;
        qyteti?: string;
        shteti?: string;
        shuma_paguar?: number | string;
      };

      const data = await this.orderService.perditesimPorosi(id, {
        status,
        adresa_dergeses,
        qyteti,
        shteti,
        shuma_paguar: shuma_paguar !== undefined ? Number(shuma_paguar) : undefined,
      });

      res.json({
        status: "success",
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  anuloPorosi = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        const err = new Error("id nuk është i vlefshëm");
        (err as any).statusCode = 400;
        throw err;
      }

      const data = await this.orderService.anuloPorosi(id);
      res.json({
        status: "success",
        data,
      });
    } catch (err) {
      next(err);
    }
  };
}