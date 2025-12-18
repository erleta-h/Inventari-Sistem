import "./models/index"; // Import asociacionet para se të përdoren
import express from "express";
import cors from "cors";
import { json } from "body-parser";
import { errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import inventoryRoutes from "./routes/inventoryRoutes";
import klientRoutes from "./routes/klientRoutes";
import furnitorRoutes from "./routes/furnitorRoutes";
import produktRoutes from "./routes/produktRoutes";
import depoRoutes from "./routes/depoRoutes";
import porosiRoutes from "./routes/porosiRoutes";
import porosiFurnizimiRoutes from "./routes/porosiFurnizimiRoutes";
import dergesaRoutes from "./routes/dergesaRoutes";
import mjetTransportuesRoutes from "./routes/mjetTransportuesRoutes";
import njoftimRoutes from "./routes/njoftimRoutes";
import raportRoutes from "./routes/raportRoutes";
import auditLogRoutes from "./routes/auditLogRoutes";
import rolRoutes from "./routes/rolRoutes";

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(json());

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/perdoruesit", userRoutes);
  app.use("/api/inventar", inventoryRoutes);
  app.use("/api/klientet", klientRoutes);
  app.use("/api/furnitoret", furnitorRoutes);
  app.use("/api/produktet", produktRoutes);
  app.use("/api/depot", depoRoutes);
  app.use("/api/porosite", porosiRoutes);
  app.use("/api/porosi-furnizimi", porosiFurnizimiRoutes);
  app.use("/api/dergesat", dergesaRoutes);
  app.use("/api/mjetet-transportuese", mjetTransportuesRoutes);
  app.use("/api/njoftimet", njoftimRoutes);
  app.use("/api/raportet", raportRoutes);
  app.use("/api/audit-logs", auditLogRoutes);
  app.use("/api/rolet", rolRoutes);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", message: "Inventari API" });
  });

  app.use(errorHandler);

  return app;
};

