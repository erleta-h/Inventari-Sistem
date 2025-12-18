import { Request, Response, NextFunction } from "express";
import { NotificationService } from "../services/NotificationService";

export class NjoftimController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  listoPerdoruesit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth?.id) {
        const err = new Error("Nuk jeni të autentifikuar");
        (err as any).statusCode = 401;
        throw err;
      }
      const rolet = req.auth.rolet || [];
      const data = await this.notificationService.gjejNjoftimetPerPerdorues(req.auth.id, rolet);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  tePaleksuar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth?.id) {
        const err = new Error("Nuk jeni të autentifikuar");
        (err as any).statusCode = 401;
        throw err;
      }
      const rolet = req.auth.rolet || [];
      const data = await this.notificationService.gjejNjoftimetTePaleksuar(req.auth.id, rolet);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  shenoSiLexuar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      await this.notificationService.shenoSiLexuar(id);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  };
}




