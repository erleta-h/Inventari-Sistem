import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/UserService";
import { RoleName } from "../models/Rol";

export class PerdoruesController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  krijo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { emer, email, password, telefoni, rolet } = req.body as {
        emer?: string;
        email?: string;
        password?: string;
        telefoni?: string;
        rolet?: RoleName[];
      };

      if (!emer || !email || !password) {
        const err = new Error("emer, email, password janë të detyrueshme");
        (err as any).statusCode = 400;
        throw err;
      }

      const perdorues = await this.userService.krijimPerdorues({
        emer,
        email,
        password,
        telefoni,
        rolet,
      });
      res.status(201).json(perdorues);
    } catch (err) {
      next(err);
    }
  };

  listo = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const perdoruesit = await this.userService.gjejTeGjithePerdoruesit();
      res.json(perdoruesit);
    } catch (err) {
      next(err);
    }
  };

  merr = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const perdorues = await this.userService.gjejPerdorues(id);
      if (!perdorues) {
        const err = new Error("Përdoruesi nuk u gjet");
        (err as any).statusCode = 404;
        throw err;
      }
      res.json(perdorues);
    } catch (err) {
      next(err);
    }
  };

  perditeso = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const { emer, email, telefoni, is_active, rolet } = req.body as {
        emer?: string;
        email?: string;
        telefoni?: string;
        is_active?: boolean;
        rolet?: RoleName[];
      };

      const perdorues = await this.userService.perditesimPerdorues(id, {
        emer,
        email,
        telefoni,
        is_active,
        rolet,
      });

      res.json(perdorues);
    } catch (err) {
      next(err);
    }
  };

  fshi = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const deletedCount = await this.userService.fshirjePerdorues(id);
      res.json({ deleted: deletedCount });
    } catch (err) {
      next(err);
    }
  };
}







