import { Request, Response, NextFunction } from "express";
import { RoleName } from "../models/Rol";

export const requireRole = (...allowedRoles: RoleName[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({
        status: "error",
        message: "Autentifikimi i kërkuar",
      });
    }

    const userRoles = req.auth.rolet || [];
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        status: "error",
        message: "Nuk keni autorizim për këtë veprim",
      });
    }

    next();
  };
};