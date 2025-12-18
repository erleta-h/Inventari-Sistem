import { Request, Response, NextFunction } from "express";
import { OrderService } from "../services/OrderService";
import { PorosiStatus } from "../models/Porosi";

export class PorosiController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  listo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Nëse ka query parameter 'perdorues_id', kthe porositë e atij përdoruesi
      if (req.query.perdorues_id) {
        const perdoruesId = Number(req.query.perdorues_id);
        if (isNaN(perdoruesId)) {
          const err = new Error("perdorues_id duhet të jetë një numër");
          (err as any).statusCode = 400;
          throw err;
        }
        const data = await this.orderService.listoPorositePerPerdorues(perdoruesId);
        res.json({
          status: "success",
          data: data,
        });
      } else {
        const data = await this.orderService.listoPorosite();
        res.json({
          status: "success",
          data: data,
        });
      }
    } catch (err) {
      next(err);
    }
  };

  merr = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
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

  krijo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth?.id) {
        const err = new Error("Nuk jeni të autentifikuar");
        (err as any).statusCode = 401;
        throw err;
      }

      const { klient_id, depo_id, artikujt, adresa_dergeses, qyteti, shteti, parapagesa } = req.body;

      // Konverto dhe verifiko klient_id
      const klientId = Number(klient_id);
      if (isNaN(klientId) || klientId <= 0) {
        const err = new Error("klient_id duhet të jetë një numër pozitiv");
        (err as any).statusCode = 400;
        throw err;
      }

      // Konverto dhe verifiko depo_id
      const depoId = Number(depo_id);
      if (isNaN(depoId) || depoId <= 0) {
        const err = new Error("depo_id duhet të jetë një numër pozitiv");
        (err as any).statusCode = 400;
        throw err;
      }

      // Verifiko artikujt - kontrollo më shumë detaje
      if (!artikujt) {
        const err = new Error("artikujt është i detyrueshëm");
        (err as any).statusCode = 400;
        throw err;
      }

      if (!Array.isArray(artikujt)) {
        const err = new Error(`artikujt duhet të jetë një array, por u mor: ${typeof artikujt}`);
        (err as any).statusCode = 400;
        throw err;
      }

      if (artikujt.length === 0) {
        const err = new Error("artikujt duhet të jetë një array me të paktën një artikull");
        (err as any).statusCode = 400;
        throw err;
      }

      // Verifiko që çdo artikull ka produkt_id dhe sasia
      for (let i = 0; i < artikujt.length; i++) {
        const artikull = artikujt[i];
        if (!artikull || typeof artikull !== 'object') {
          const err = new Error(`Artikulli në pozicion ${i} nuk është i vlefshëm`);
          (err as any).statusCode = 400;
          throw err;
        }
        if (!artikull.produkt_id || Number(artikull.produkt_id) <= 0) {
          const err = new Error(`Artikulli në pozicion ${i} nuk ka produkt_id të vlefshëm`);
          (err as any).statusCode = 400;
          throw err;
        }
        if (!artikull.sasia || Number(artikull.sasia) <= 0) {
          const err = new Error(`Artikulli në pozicion ${i} nuk ka sasi të vlefshme`);
          (err as any).statusCode = 400;
          throw err;
        }
      }

      const porosi = await this.orderService.krijimPorosi({
        klient_id: klientId,
        depo_id: depoId,
        artikujt: artikujt,
        adresa_dergeses: adresa_dergeses || null,
        qyteti: qyteti || null,
        shteti: shteti || null,
        parapagesa: parapagesa ? Number(parapagesa) : undefined,
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

  perditeso = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const { status, adresa_dergeses, qyteti, shteti, shuma_paguar } = req.body as {
        status?: PorosiStatus;
        adresa_dergeses?: string;
        qyteti?: string;
        shteti?: string;
        shuma_paguar?: number;
      };

      const porosi = await this.orderService.perditesimPorosi(id, {
        status,
        adresa_dergeses,
        qyteti,
        shteti,
        shuma_paguar: shuma_paguar !== undefined ? Number(shuma_paguar) : undefined,
      });

      res.json(porosi);
    } catch (err) {
      next(err);
    }
  };

  perditesoPagese = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const { shuma_paguar } = req.body as {
        shuma_paguar: number;
      };

      if (shuma_paguar === undefined || shuma_paguar < 0) {
        const err = new Error("shuma_paguar duhet të jetë një numër pozitiv");
        (err as any).statusCode = 400;
        throw err;
      }

      const porosi = await this.orderService.merrPorosi(id);
      if (!porosi) {
        const err = new Error("Porosia nuk u gjet");
        (err as any).statusCode = 404;
        throw err;
      }

      const shumaPaguar = Number(shuma_paguar);
      const totalAmount = Number(porosi.total_amount);
      
      if (shumaPaguar > totalAmount) {
        const err = new Error(`Shuma e paguar (${shumaPaguar}) nuk mund të jetë më e madhe se totali (${totalAmount})`);
        (err as any).statusCode = 400;
        throw err;
      }

      const porosiPerditesuar = await this.orderService.perditesimPorosi(id, {
        shuma_paguar: shumaPaguar,
      });

      res.json({
        status: "success",
        data: porosiPerditesuar,
      });
    } catch (err) {
      next(err);
    }
  };

  anulo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const porosi = await this.orderService.anuloPorosi(id);
      res.json(porosi);
    } catch (err) {
      next(err);
    }
  };

  bejGati = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const porosi = await this.orderService.bejGatiPorosi(id);
      res.json({
        status: "success",
        data: porosi,
      });
    } catch (err) {
      next(err);
    }
  };

  filloPergatitje = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const porosi = await this.orderService.filloPergatitjePorosi(id);
      res.json({
        status: "success",
        data: porosi,
      });
    } catch (err) {
      next(err);
    }
  };
}