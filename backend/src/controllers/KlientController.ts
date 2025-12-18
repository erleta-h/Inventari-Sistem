import { Request, Response, NextFunction } from "express";
import { KlientService } from "../services/KlientService";
import { KlientTipi } from "../models/Klient";

export class KlientController {
  private klientService: KlientService;

  constructor() {
    this.klientService = new KlientService();
  }

  listo = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.klientService.listoKlientet();
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
      const klient = await this.klientService.merrKlient(id);
      if (!klient) {
        const err = new Error("Klienti nuk u gjet");
        (err as any).statusCode = 404;
        throw err;
      }
      res.json(klient);
    } catch (err) {
      next(err);
    }
  };

  krijo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { emer, tipi, email, telefoni, adresa, qyteti, shteti, is_active } =
        req.body as {
          emer?: string;
          tipi?: KlientTipi;
          email?: string | null;
          telefoni?: string | null;
          adresa?: string | null;
          qyteti?: string | null;
          shteti?: string | null;
          is_active?: boolean;
        };

      if (!emer || !tipi) {
        const err = new Error("emer dhe tipi janë të detyrueshme");
        (err as any).statusCode = 400;
        throw err;
      }

      const klient = await this.klientService.krijoKlient({
        emer,
        tipi,
        email,
        telefoni,
        adresa,
        qyteti,
        shteti,
        is_active,
      });
      res.status(201).json(klient);
    } catch (err) {
      next(err);
    }
  };

  perditeso = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const klient = await this.klientService.perditesoKlient(id, req.body);
      res.json(klient);
    } catch (err) {
      next(err);
    }
  };

  fshi = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const deleted = await this.klientService.fshiKlient(id);
      res.json({ deleted });
    } catch (err) {
      next(err);
    }
  };
}




