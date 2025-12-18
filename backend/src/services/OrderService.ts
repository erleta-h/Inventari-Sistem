import { PorosiRepository } from "../repositories/PorosiRepository";
import { ArtikullPorosie } from "../models/ArtikullPorosie";
import { Porosi, PorosiStatus } from "../models/Porosi";
import { ProduktRepository } from "../repositories/ProduktRepository";
import { InventoryService } from "./InventoryService";
import { TransaksionTipi, ReferenceType } from "../models/TransaksionInventari";

export interface KrijimPorosiData {
  klient_id: number;
  depo_id: number;
  adresa_dergeses?: string;
  qyteti?: string;
  shteti?: string;
  parapagesa?: number;
  artikujt: {
    produkt_id: number;
    sasia: number;
  }[];
  created_by: number;
}

export class OrderService {
  private porosiRepository: PorosiRepository;
  private produktRepository: ProduktRepository;
  private inventoryService: InventoryService;

  constructor() {
    this.porosiRepository = new PorosiRepository();
    this.produktRepository = new ProduktRepository();
    this.inventoryService = new InventoryService();
  }

  async krijimPorosi(data: KrijimPorosiData): Promise<Porosi> {
    // Verifiko produktet dhe llogarit totalin
    let totalAmount = 0;
    const artikujt = [];

    for (const item of data.artikujt) {
      // Konverto sasinë në number dhe verifiko
      const sasia = Number(item.sasia);
      if (isNaN(sasia) || sasia <= 0) {
        throw new Error(`Sasia e produktit me ID ${item.produkt_id} duhet të jetë një numër pozitiv`);
      }

      const produktId = Number(item.produkt_id);
      if (isNaN(produktId) || produktId <= 0) {
        throw new Error(`Produkt ID ${item.produkt_id} nuk është i vlefshëm`);
      }

      const produkt = await this.produktRepository.gjejNgaId(produktId);
      if (!produkt || !produkt.is_active) {
        throw new Error(`Produkti me ID ${produktId} nuk u gjet ose nuk është aktiv`);
      }

      // Verifiko stokun
      const sasiaNeStok = await this.inventoryService.kontrolloSasine(
        produktId,
        data.depo_id
      );

      if (sasiaNeStok < sasia) {
        throw new Error(
          `Stoku i pamjaftueshëm për produktin ${produkt.emer}. Stoku aktual: ${sasiaNeStok}, Kërkuar: ${sasia}`
        );
      }

      const cmimiNjesi = Number(produkt.cmimi_njesi);
      if (isNaN(cmimiNjesi)) {
        throw new Error(`Çmimi i produktit ${produkt.emer} nuk është i vlefshëm`);
      }

      const lineTotal = cmimiNjesi * sasia;
      totalAmount += lineTotal;

      artikujt.push({
        produkt_id: produktId,
        sasia: sasia,
        cmimi_njesi: cmimiNjesi,
        line_total: lineTotal,
      });
    }

    // Validim parapagesa
    const parapagesa = data.parapagesa ? Number(data.parapagesa) : 0;
    if (parapagesa < 0 || parapagesa > totalAmount) {
      throw new Error(`Parapagesa duhet të jetë midis 0 dhe ${totalAmount}`);
    }

    // Krijo porosinë - automatikisht CONFIRMED pas krijimit
    const porosi = await this.porosiRepository.krijim({
      klient_id: data.klient_id,
      depo_id: data.depo_id,
      status: PorosiStatus.CONFIRMED,
      total_amount: totalAmount,
      currency: "EUR",
      adresa_dergeses: data.adresa_dergeses || null,
      qyteti: data.qyteti || null,
      shteti: data.shteti || null,
      parapagesa: parapagesa,
      shuma_paguar: parapagesa, // Fillimisht shuma_paguar = parapagesa
      created_by: data.created_by,
    });

    // Krijo artikujt e porosisë
    for (const artikull of artikujt) {
      await ArtikullPorosie.create({
        porosi_id: porosi.id,
        ...artikull,
      });
    }

    const porosiMeDetaje = await this.porosiRepository.gjejMeDetaje(porosi.id);
    if (!porosiMeDetaje) {
      throw new Error("Porosia nuk u gjet pas krijimit");
    }
    return porosiMeDetaje;
  }

  async merrPorosi(id: number) {
    return await this.porosiRepository.gjejMeDetaje(id);
  }

  async listoPorosite() {
    return await this.porosiRepository.gjejTeGjithaMeDetaje();
  }

  async listoPorositePerPerdorues(perdoruesId: number) {
    return await this.porosiRepository.gjejPerPerdorues(perdoruesId);
  }

  async bejGatiPorosi(id: number): Promise<Porosi> {
    const porosi = await this.porosiRepository.gjejNgaId(id);
    if (!porosi) {
      throw new Error("Porosia nuk u gjet");
    }

    // Verifiko që porosia është në status PREPARING
    if ((porosi as any).status !== PorosiStatus.PREPARING) {
      throw new Error("Porosia duhet të jetë në status PREPARING për të shënuar si gati");
    }

    // Përditëso statusin në READY_FOR_SHIPPING
    // Përdor query direkt për të shmangur problemet me cache
    const { sequelize } = await import("../config/database");
    await sequelize.query(
      `UPDATE porosite SET status = :status, updated_at = NOW() WHERE id = :id AND deleted_at IS NULL`,
      {
        replacements: { status: PorosiStatus.READY_FOR_SHIPPING, id },
      }
    );

    const porosiMeDetaje = await this.porosiRepository.gjejMeDetaje(id);
    if (!porosiMeDetaje) {
      throw new Error("Porosia nuk u gjet pas përditësimit");
    }
    return porosiMeDetaje;
  }

  async filloPergatitjePorosi(id: number): Promise<Porosi> {
    const porosi = await this.porosiRepository.gjejNgaId(id);
    if (!porosi) {
      throw new Error("Porosia nuk u gjet");
    }

    // Verifiko që porosia është në status CONFIRMED
    if ((porosi as any).status !== PorosiStatus.CONFIRMED) {
      throw new Error("Porosia duhet të jetë në status CONFIRMED për të filluar përgatitjen");
    }

    // Përditëso statusin në PREPARING
    await this.porosiRepository.perditesim(id, {
      status: PorosiStatus.PREPARING,
    });

    const porosiMeDetaje = await this.porosiRepository.gjejMeDetaje(id);
    if (!porosiMeDetaje) {
      throw new Error("Porosia nuk u gjet pas përditësimit");
    }
    return porosiMeDetaje;
  }

  async perditesimPorosi(
    id: number,
    data: {
      status?: PorosiStatus;
      adresa_dergeses?: string;
      qyteti?: string;
      shteti?: string;
      shuma_paguar?: number;
    }
  ) {
    const porosi = await this.porosiRepository.gjejNgaId(id);
    if (!porosi) {
      throw new Error("Porosia nuk u gjet");
    }

    await this.porosiRepository.perditesim(id, data);
    const porosiMeDetaje = await this.porosiRepository.gjejMeDetaje(id);
    if (!porosiMeDetaje) {
      throw new Error("Porosia nuk u gjet pas përditësimit");
    }
    return porosiMeDetaje;
  }

  async anuloPorosi(id: number) {
    const porosi = await this.porosiRepository.gjejMeDetaje(id);
    if (!porosi) {
      throw new Error("Porosia nuk u gjet");
    }

    if (porosi.status === PorosiStatus.DELIVERED) {
      throw new Error("Porosia e dorëzuar nuk mund të anulohet");
    }

    // Nëse porosia ka qenë konfirmuar, rikthe stokun
    if (
      porosi.status === PorosiStatus.CONFIRMED ||
      porosi.status === PorosiStatus.PREPARING ||
      porosi.status === PorosiStatus.READY_FOR_SHIPPING
    ) {
      const artikujt = (porosi as any).artikujt || [];
      for (const artikull of artikujt) {
        // Rrit stokun përsëri
        // Kjo do të implementohet më mirë me InventoryService
      }
    }

    await this.porosiRepository.perditesim(id, {
      status: PorosiStatus.CANCELLED,
    });

    const porosiMeDetaje = await this.porosiRepository.gjejMeDetaje(id);
    if (!porosiMeDetaje) {
      throw new Error("Porosia nuk u gjet pas anulimit");
    }
    return porosiMeDetaje;
  }

  async llogaritTotal(artikujt: { produkt_id: number; sasia: number }[]): Promise<number> {
    let total = 0;
    for (const item of artikujt) {
      const produkt = await this.produktRepository.gjejNgaId(item.produkt_id);
      if (produkt) {
        total += Number(produkt.cmimi_njesi) * item.sasia;
      }
    }
    return total;
  }
}