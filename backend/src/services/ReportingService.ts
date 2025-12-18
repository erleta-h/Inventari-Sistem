import { PorosiRepository } from "../repositories/PorosiRepository";
import { InventarRepository } from "../repositories/InventarRepository";
import { PorosiFurnizimiRepository } from "../repositories/PorosiFurnizimiRepository";
import { TransaksionInventariRepository } from "../repositories/TransaksionInventariRepository";
import { PorosiStatus } from "../models/Porosi";
import { PorosiFurnizimiStatus } from "../models/PorosiFurnizimi";
import { TransaksionTipi, ReferenceType } from "../models/TransaksionInventari";
import { ArtikullPorosiFurnizimi } from "../models/ArtikullPorosiFurnizimi";
import { sequelize } from "../config/database";
import { QueryTypes } from "sequelize";

export class ReportingService {
  private porosiRepository: PorosiRepository;
  private inventarRepository: InventarRepository;
  private porosiFurnizimiRepository: PorosiFurnizimiRepository;
  private transaksionRepository: TransaksionInventariRepository;

  constructor() {
    this.porosiRepository = new PorosiRepository();
    this.inventarRepository = new InventarRepository();
    this.porosiFurnizimiRepository = new PorosiFurnizimiRepository();
    this.transaksionRepository = new TransaksionInventariRepository();
  }

  async gjeneroRaportInventari() {
    const inventari = await this.inventarRepository.gjejTeGjithaMeDetaje();
    const produktetMeStokMinimal = inventari.filter(
      (inv) => Number(inv.sasia) <= Number(inv.sasia_minimale || 0)
    );
    return {
      status: "success",
      data: {
        total_produkte: inventari.length,
        inventari,
        total_vlera: inventari.reduce((sum, inv) => {
          const produkt = (inv as any).produkt;
          return sum + Number(produkt?.cmimi_njesi || 0) * Number(inv.sasia);
        }, 0),
        produktet_me_stok_minimal: produktetMeStokMinimal.length,
      },
    };
  }

  async gjeneroRaportPerformancës() {
    const porosite = await this.porosiRepository.gjejTeGjithaMeDetaje();
    const totalPorosite = porosite.length;
    const porositeDorëzuar = porosite.filter(
      (p) => p.status === PorosiStatus.DELIVERED
    ).length;
    const porositeAnuluar = porosite.filter(
      (p) => p.status === PorosiStatus.CANCELLED
    ).length;
    const totalVlera = porosite.reduce(
      (sum, p) => sum + Number(p.total_amount),
      0
    );

    return {
      status: "success",
      data: {
        total_porosite: totalPorosite,
        porosite_dorëzuar: porositeDorëzuar,
        porosite_anuluar: porositeAnuluar,
        total_vlera: totalVlera,
        norma_suksesi:
          totalPorosite > 0
            ? Number(((porositeDorëzuar / totalPorosite) * 100).toFixed(2))
            : 0,
      },
    };
  }

  async gjeneroRaportFurnitorësh() {
    const porositeFurnizimi =
      await this.porosiFurnizimiRepository.gjejTeGjithaMeDetaje();
    const porositeKompletuar = porositeFurnizimi.filter(
      (p) => p.status === PorosiFurnizimiStatus.COMPLETED
    );

    return {
      status: "success",
      data: {
        total_porosite: porositeFurnizimi.length,
        porosite_kompletuar: porositeKompletuar.length,
        porosite: porositeFurnizimi,
      },
    };
  }

  async gjeneroRaportFinanciar() {
    // Të hyrat: shuma_paguar nga porositë e dorëzuara
    const porositeDorëzuar = await sequelize.query(
      `SELECT COALESCE(SUM(shuma_paguar), 0) as total_hyrat
       FROM porosite
       WHERE status = :status`,
      {
        replacements: { status: PorosiStatus.DELIVERED },
        type: QueryTypes.SELECT,
      }
    ) as any[];

    const totalHyrat = Number(porositeDorëzuar[0]?.total_hyrat || 0);

    // Malli i marrë: të gjitha transaksionet RECEIPT (edhe manuale edhe nga porosi furnizimi)
    const transaksionetPranimit = await sequelize.query(
      `SELECT COALESCE(SUM(ti.sasia_delta), 0) as total_mall_i_marre
       FROM transaksionet_inventarit ti
       WHERE ti.tipi = :tipi`,
      {
        replacements: { 
          tipi: TransaksionTipi.RECEIPT
        },
        type: QueryTypes.SELECT,
      }
    ) as any[];

    const totalMallIMarre = Number(transaksionetPranimit[0]?.total_mall_i_marre || 0);

    // Shpenzimet: totali i cmimi_njesi * sasia_pranuar nga ArtikullPorosiFurnizimi për porositë e kompletuara
    const shpenzimet = await sequelize.query(
      `SELECT COALESCE(SUM(apf.cmimi_njesi * apf.sasia_pranuar), 0) as total_shpenzime
       FROM artikujt_porosisefurnizimi apf
       INNER JOIN porosi_furnizimi pf ON apf.porosi_furnizimi_id = pf.id
       WHERE pf.status = :status
         AND apf.sasia_pranuar > 0`,
      {
        replacements: { status: PorosiFurnizimiStatus.COMPLETED },
        type: QueryTypes.SELECT,
      }
    ) as any[];

    const totalShpenzime = Number(shpenzimet[0]?.total_shpenzime || 0);

    // Fitimi/Humbja: Të hyrat - Shpenzimet
    const fitimiHumbja = totalHyrat - totalShpenzime;

    // Merr detajet e pranimeve manuale (transaksionet RECEIPT me reference_type = OTHER)
    const pranimetManuale = await sequelize.query(
      `SELECT 
        ti.id as transaksion_id,
        ti.sasia_delta,
        ti.created_at,
        ti.reference_id as furnitor_id,
        f.emer as furnitor_emer,
        i.depo_id,
        i.produkt_id,
        p.emer as produkt_emer,
        d.emer as depo_emer
       FROM transaksionet_inventarit ti
       INNER JOIN inventari i ON ti.inventar_id = i.id
       INNER JOIN produktet p ON i.produkt_id = p.id
       INNER JOIN depot d ON i.depo_id = d.id
       LEFT JOIN furnitoret f ON ti.reference_id = f.id
       WHERE ti.tipi = :tipi
         AND (ti.reference_type = :reference_type_other OR ti.reference_type IS NULL)
       ORDER BY ti.created_at DESC`,
      {
        replacements: { 
          tipi: TransaksionTipi.RECEIPT,
          reference_type_other: ReferenceType.OTHER
        },
        type: QueryTypes.SELECT,
      }
    ) as any[];

    // Merr detajet e porosive të furnizimit të kompletuara (për shpenzimet)
    const porositeFurnizimi = await this.porosiFurnizimiRepository.gjejTeGjithaMeDetaje();
    const porositeFurnizimiKompletuar = porositeFurnizimi
      .filter((p) => p.status === PorosiFurnizimiStatus.COMPLETED)
      .map((p) => {
        const porosiJson = (p as any).toJSON ? (p as any).toJSON() : JSON.parse(JSON.stringify(p));
        return porosiJson;
      });

    // Merr detajet e porosive të dorëzuara (për të hyrat)
    const porositeDorëzuarDetaje = await this.porosiRepository.gjejTeGjithaMeDetaje();
    const porositeDorëzuarLista = porositeDorëzuarDetaje
      .filter((p) => p.status === PorosiStatus.DELIVERED)
      .map((p) => {
        const porosiJson = (p as any).toJSON ? (p as any).toJSON() : JSON.parse(JSON.stringify(p));
        return porosiJson;
      });

    return {
      status: "success",
      data: {
        total_hyrat: totalHyrat,
        total_mall_i_marre: totalMallIMarre,
        total_shpenzime: totalShpenzime,
        fitimi_humbja: fitimiHumbja,
        eshte_plus: fitimiHumbja >= 0,
        porosite_furnizimi: porositeFurnizimiKompletuar,
        porosite_dorëzuar: porositeDorëzuarLista,
        pranimet_manuale: pranimetManuale, // Pranimet manuale (pa porosi furnizimi)
      },
    };
  }
}

