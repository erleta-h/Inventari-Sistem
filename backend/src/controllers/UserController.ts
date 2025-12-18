import { Request, Response } from "express";
import { UserService } from "../services/UserService";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  krijimPerdorues = async (req: Request, res: Response) => {
    try {
      const { emer, email, password, telefoni, rolet } = req.body;

      if (!emer || !email || !password) {
        return res.status(400).json({
          status: "error",
          message: "Emri, emaili dhe fjalëkalimi janë të nevojshëm",
        });
      }

      const perdorues = await this.userService.krijimPerdorues({
        emer,
        email,
        password,
        telefoni,
        rolet: rolet || [],
      });

      res.status(201).json({
        status: "success",
        data: perdorues,
      });
    } catch (error: any) {
      res.status(400).json({
        status: "error",
        message: error.message || "Gabim në krijimin e përdoruesit",
      });
    }
  };

  listoPerdoruesit = async (_req: Request, res: Response) => {
    try {
      const perdoruesit = await this.userService.gjejTeGjithePerdoruesit();
      res.json({
        status: "success",
        data: perdoruesit,
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Gabim në marrjen e përdoruesve",
      });
    }
  };

  gjejPerdorues = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const perdorues = await this.userService.gjejPerdorues(id);

      if (!perdorues) {
        return res.status(404).json({
          status: "error",
          message: "Përdoruesi nuk u gjet",
        });
      }

      res.json({
        status: "success",
        data: perdorues,
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Gabim në marrjen e përdoruesit",
      });
    }
  };

  perditesimPerdorues = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { emer, email, telefoni, is_active, rolet } = req.body;

      const perdorues = await this.userService.perditesimPerdorues(id, {
        emer,
        email,
        telefoni,
        is_active,
        rolet,
      });

      res.json({
        status: "success",
        data: perdorues,
      });
    } catch (error: any) {
      res.status(400).json({
        status: "error",
        message: error.message || "Gabim në përditësimin e përdoruesit",
      });
    }
  };

  fshirjePerdorues = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await this.userService.fshirjePerdorues(id);

      res.json({
        status: "success",
        message: "Përdoruesi u fshi me sukses",
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Gabim në fshirjen e përdoruesit",
      });
    }
  };
}






