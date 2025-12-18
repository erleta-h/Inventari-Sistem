import { Request, Response } from "express";
import { InventoryService } from "../services/InventoryService";
import { ReferenceType } from "../models/TransaksionInventari";

export class InventoryController {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  // NOTE: Ky controller duket legacy; rrugët aktuale përdorin `InventarController`.
  // E mbajmë vetëm për kompatibilitet nëse diku importohet.
  merrInventarin = async (_req: Request, res: Response) => {
    try {
      const inventari = await this.inventoryService.merrInventarin();
      res.json({
        status: "success",
        data: inventari,
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Gabim në marrjen e inventarit",
      });
    }
  };

  pranoMallin = async (req: Request, res: Response) => {
    try {
      if (!req.auth?.id) {
        return res.status(401).json({
          status: "error",
          message: "Nuk jeni të autentifikuar",
        });
      }

      const {
        depo_id,
        produkt_id,
        sasia,
        furnitor_id,
        furnitor_emer,
        reference_type,
        reference_id,
      } = req.body as any;

      if (!depo_id || !produkt_id || !sasia) {
        return res.status(400).json({
          status: "error",
          message: "Depo, produkt dhe sasia janë të nevojshëm",
        });
      }

      const depoId = Number(depo_id);
      const produktId = Number(produkt_id);
      const sasiaNum = Number(sasia);
      if (isNaN(depoId) || isNaN(produktId) || isNaN(sasiaNum)) {
        return res.status(400).json({
          status: "error",
          message: "depo_id, produkt_id dhe sasia duhet të jenë numra",
        });
      }

      const inventar = await this.inventoryService.pranoMallin(
        depoId,
        produktId,
        sasiaNum,
        req.auth.id,
        furnitor_id !== undefined && furnitor_id !== null ? Number(furnitor_id) : undefined,
        furnitor_emer || undefined,
        reference_type || ReferenceType.OTHER,
        reference_id !== undefined && reference_id !== null ? Number(reference_id) : undefined
      );

      res.json({
        status: "success",
        data: inventar,
      });
    } catch (error: any) {
      res.status(400).json({
        status: "error",
        message: error.message || "Gabim në pranimin e mallit",
      });
    }
  };

  gjejProdukteMeStokMinimal = async (_req: Request, res: Response) => {
    try {
      const produkte = await this.inventoryService.gjejProdukteMeStokMinimal();
      res.json({
        status: "success",
        data: produkte,
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Gabim në marrjen e produkteve me stok minimal",
      });
    }
  };

  transferoProdukte = async (req: Request, res: Response) => {
    try {
      if (!req.auth?.id) {
        return res.status(401).json({
          status: "error",
          message: "Nuk jeni të autentifikuar",
        });
      }

      const { produkt_id, from_depo_id, to_depo_id, sasia } = req.body;

      if (!produkt_id || !from_depo_id || !to_depo_id || !sasia) {
        return res.status(400).json({
          status: "error",
          message: "Të gjitha fushat janë të nevojshme për transfer",
        });
      }

      const transfer = await this.inventoryService.transferoProdukte(
        Number(produkt_id),
        Number(from_depo_id),
        Number(to_depo_id),
        Number(sasia),
        req.auth.id
      );

      res.json({
        status: "success",
        data: transfer,
      });
    } catch (error: any) {
      res.status(400).json({
        status: "error",
        message: error.message || "Gabim në transferimin e produkteve",
      });
    }
  };
}