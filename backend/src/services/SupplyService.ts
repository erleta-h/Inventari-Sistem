import { PorosiFurnizimiRepository } from "../repositories/PorosiFurnizimiRepository";
import { FurnitorRepository } from "../repositories/FurnitorRepository";
import { ArtikullPorosiFurnizimi } from "../models/ArtikullPorosiFurnizimi";
import { PorosiFurnizimi, PorosiFurnizimiStatus } from "../models/PorosiFurnizimi";
import { InventoryService } from "./InventoryService";
import { ReferenceType } from "../models/TransaksionInventari";

export interface KrijimPorosiFurnizimiData {
  furnitor_id: number;
  depo_id: number;
  data_pritjes?: Date;
  artikujt: {
    produkt_id: number;
    sasia_porositur: number;
    cmimi_njesi: number;
  }[];
  created_by: number;
}

export class SupplyService {
  private porosiFurnizimiRepository: PorosiFurnizimiRepository;
  private furnitorRepository: FurnitorRepository;
  private inventoryService: InventoryService;

  constructor() {
    this.porosiFurnizimiRepository = new PorosiFurnizimiRepository();
    this.furnitorRepository = new FurnitorRepository();
    this.inventoryService = new InventoryService();
  }

  async krijimPorosiFurnizimi(
    data: KrijimPorosiFurnizimiData
  ): Promise<PorosiFurnizimi> {
    const porosi = await this.porosiFurnizimiRepository.krijim({
      furnitor_id: data.furnitor_id,
      depo_id: data.depo_id,
      status: PorosiFurnizimiStatus.DRAFT,
      data_pritjes: data.data_pritjes || null,
      data_pranimit: null,
      created_by: data.created_by,
    });

    for (const artikull of data.artikujt) {
      await ArtikullPorosiFurnizimi.create({
        porosi_furnizimi_id: porosi.id,
        produkt_id: artikull.produkt_id,
        sasia_porositur: artikull.sasia_porositur,
        sasia_pranuar: 0,
        cmimi_njesi: artikull.cmimi_njesi,
      });
    }

    const porosiMeDetaje = await this.porosiFurnizimiRepository.gjejMeDetaje(porosi.id);
    if (!porosiMeDetaje) {
      throw new Error("Porosia e furnizimit nuk u gjet pas krijimit");
    }
    return porosiMeDetaje;
  }

  async merrPorosiFurnizimi(id: number) {
    return await this.porosiFurnizimiRepository.gjejMeDetaje(id);
  }

  async listoPorositeFurnizimi() {
    return await this.porosiFurnizimiRepository.gjejTeGjithaMeDetaje();
  }

  async pranoMallin(
    porosiFurnizimiId: number,
    artikujtPranuar: { produkt_id: number; sasia_pranuar: number }[],
    createdBy: number
  ) {
    const porosi = await this.porosiFurnizimiRepository.gjejMeDetaje(
      porosiFurnizimiId
    );
    if (!porosi) {
      throw new Error("Porosia e furnizimit nuk u gjet");
    }

    const artikujt = (porosi as any).artikujt || [];

    for (const artikullPranuar of artikujtPranuar) {
      const artikull = artikujt.find(
        (a: any) => a.produkt_id === artikullPranuar.produkt_id
      );

      if (!artikull) {
        throw new Error(
          `Artikulli me produkt_id ${artikullPranuar.produkt_id} nuk u gjet në porosi`
        );
      }

      // Përditëso sasinë e pranuar
      await ArtikullPorosiFurnizimi.update(
        {
          sasia_pranuar: artikullPranuar.sasia_pranuar,
        },
        {
          where: { id: artikull.id },
        }
      );

      // Përditëso stokun në inventar
      await this.inventoryService.pranoMallin(
        porosi.depo_id,
        artikullPranuar.produkt_id,
        artikullPranuar.sasia_pranuar,
        createdBy,
        undefined, // furnitorId - nuk është i nevojshëm sepse ka reference_id
        undefined, // furnitorEmer - nuk është i nevojshëm
        ReferenceType.POROSI_FURNIZIMI,
        porosiFurnizimiId
      );
    }

    // Përditëso statusin e porosisë
    await this.porosiFurnizimiRepository.perditesim(porosiFurnizimiId, {
      status: PorosiFurnizimiStatus.COMPLETED,
      data_pranimit: new Date(),
    });

    const porosiMeDetaje = await this.porosiFurnizimiRepository.gjejMeDetaje(porosiFurnizimiId);
    if (!porosiMeDetaje) {
      throw new Error("Porosia e furnizimit nuk u gjet pas përditësimit");
    }
    return porosiMeDetaje;
  }
}