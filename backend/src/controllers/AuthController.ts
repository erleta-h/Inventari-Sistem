import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          status: "error",
          message: "Email dhe fjalëkalimi janë të nevojshëm",
        });
      }

      const result = await this.authService.login(email, password);

      console.log("LOGIN OK:", { email, userId: result.perdorues.id });

      res.json({
        status: "success",
        data: result,
      });
    } catch (error: any) {
      console.error("Login error:", error);
      console.error("Error stack:", error.stack);
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        code: error.code,
      });
      
      // Nëse është gabim i autentifikimit, kthe 401
      if (error.message && (
        error.message.includes("Email ose fjalëkalim") ||
        error.message.includes("Përdoruesi nuk u gjet")
      )) {
        return res.status(401).json({
          status: "error",
          message: error.message || "Email ose fjalëkalim i pasaktë",
        });
      }

      // Për gabime të tjera, kthe 500 me detaje në development
      const isDevelopment = process.env.NODE_ENV === "development" || !process.env.NODE_ENV;
      res.status(500).json({
        status: "error",
        message: error.message || "Gabim në autentifikim",
        ...(isDevelopment && { 
          stack: error.stack,
          details: error.toString(),
          errorName: error.name,
          errorCode: error.code,
        }),
      });
    }
  };
}

