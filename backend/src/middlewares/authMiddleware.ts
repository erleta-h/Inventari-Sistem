import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

// Tip alias për request me `req.auth` (tipizimi bëhet nga `src/types/express.d.ts`)
export type AuthRequest = Request;

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Token i autentifikimit nuk u gjet",
      });
    }

    const decoded = jwt.verify(token, env.jwt.secret) as any;
    req.auth = {
      id: decoded.id,
      email: decoded.email,
      rolet: decoded.rolet || [],
    };

    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Token i pavlefshëm",
    });
  }
};

// Alias për kompatibilitet me kod ekzistues
export const autentifiko = authMiddleware;

// Funksion për autorizim bazuar në role
export function autorizoRolet(...roletLejuara: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const rolet = req.auth?.rolet || [];
    const lejuar =
      roletLejuara.length === 0 || rolet.some((r) => roletLejuara.includes(r));

    if (!lejuar) {
      const err = new Error("Nuk keni autorizim për këtë veprim");
      (err as any).statusCode = 403;
      return next(err);
    }

    return next();
  };
}

