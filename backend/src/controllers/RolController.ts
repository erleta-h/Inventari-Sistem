import { Request, Response, NextFunction } from "express";
import { RolService } from "../services/RolService";

export class RolController {
  private rolService: RolService;

  constructor() {
    this.rolService = new RolService();
  }

  listo = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const rolet = await this.rolService.listoRolet();
      res.json(rolet);
    } catch (err) {
      next(err);
    }
  };
}







