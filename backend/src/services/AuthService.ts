import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import "../models/index"; // Import asociacionet
import { PerdoruesRepository } from "../repositories/PerdoruesRepository";
import { AuditLogService } from "./AuditLogService";
import { RoleName } from "../models/Rol";

export interface LoginResult {
  token: string;
  perdorues: {
    id: number;
    emer: string;
    email: string;
    rolet: string[];
  };
}

export class AuthService {
  private perdoruesRepository: PerdoruesRepository;
  private auditLogService: AuditLogService;

  constructor() {
    this.perdoruesRepository = new PerdoruesRepository();
    this.auditLogService = new AuditLogService();
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const perdorues = await this.perdoruesRepository.gjejMeEmail(email);

    if (!perdorues || !perdorues.is_active) {
      throw new Error("Email ose fjalëkalim i pasaktë");
    }

    const passwordValid = await bcrypt.compare(
      password,
      perdorues.password_hash
    );

    if (!passwordValid) {
      throw new Error("Email ose fjalëkalim i pasaktë");
    }

    const perdoruesMeRolet = await this.perdoruesRepository.gjejMeRolet(
      perdorues.id
    );

    if (!perdoruesMeRolet) {
      throw new Error("Përdoruesi nuk u gjet");
    }

    const rolet = (perdoruesMeRolet as any).rolet?.map(
      (r: any) => r.name
    ) || [];

    const secret: string = env.jwt.secret || "change-me-in-production";
    const expiresIn: string = env.jwt.expiresIn || "7d";
    
    const token = jwt.sign(
      {
        id: perdorues.id,
        email: perdorues.email,
        rolet,
      },
      secret,
      { expiresIn } as jwt.SignOptions
    );

    // Krijo audit log për login (sekundar, nuk duhet ta rrëzojë login-in)
    try {
      await this.auditLogService.log({
        perdorues_id: perdorues.id,
        action: "LOGIN",
        details: `Login i suksesshëm për ${perdorues.email}`,
      });
    } catch (err) {
      console.warn("AuditLog dështoi, por login vazhdoi:", err);
    }

    return {
      token,
      perdorues: {
        id: perdorues.id,
        emer: perdorues.emer,
        email: perdorues.email,
        rolet,
      },
    };
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
}

