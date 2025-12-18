import { InventarRepository } from "../repositories/InventarRepository";
import { TransaksionInventariRepository } from "../repositories/TransaksionInventariRepository";
import { TransferDepoRepository } from "../repositories/TransferDepoRepository";
import { NjoftimRepository } from "../repositories/NjoftimRepository";
import { FurnitorRepository } from "../repositories/FurnitorRepository";
import { Inventar } from "../models/Inventar";
import { TransaksionInventari, TransaksionTipi, ReferenceType } from "../models/TransaksionInventari";
import { TransferDepo, TransferStatus } from "../models/TransferDepo";
import { Njoftim, NjoftimTipi } from "../models/Njoftim";
import { Perdorues } from "../models/Perdorues";
import { Rol, RoleName } from "../models/Rol";
import { PerdoruesRol } from "../models/PerdoruesRol";
import { Produkt } from "../models/Produkt";
import { Depo } from "../models/Depo";
import { Furnitor } from "../models/Furnitor";

export class InventoryService {
  private inventarRepository: InventarRepository;
  private transaksionRepository: TransaksionInventariRepository;
  private transferRepository: TransferDepoRepository;
  private njoftimRepository: NjoftimRepository;
  private furnitorRepository: FurnitorRepository;

  constructor() {
    this.inventarRepository = new InventarRepository();
    this.transaksionRepository = new TransaksionInventariRepository();
    this.transferRepository = new TransferDepoRepository();
    this.njoftimRepository = new NjoftimRepository();
    this.furnitorRepository = new FurnitorRepository();
  }

  async merrInventarin() {
    return await this.inventarRepository.gjejTeGjithaMeDetaje();
  }

  async merrTransferet() {
    return await this.transferRepository.gjejTeGjithaMeDetaje();
  }

  async pranoMallin(
    depoId: number,
    produktId: number,
    sasia: number,
    createdBy: number,
    furnitorId?: number,
    furnitorEmer?: string,
    referenceType?: ReferenceType,
    referenceId?: number
  ) {
    // Nëse furnitor_id nuk është dhënë por furnitor_emer është dhënë, krijo furnitor të ri
    let finalFurnitorId = furnitorId;
    if (!finalFurnitorId && furnitorEmer) {
      // Krijo furnitor të ri nëse nuk ekziston
      const furnitor = await this.furnitorRepository.krijim({
        emer: furnitorEmer,
        kontakt_emer: null,
        email: null,
        telefoni: null,
        adresa: null,
        is_active: true,
      });
      finalFurnitorId = furnitor.id;
    }

    // Gjej ose krijo inventar
    let inventar = await this.inventarRepository.gjejPerDepoDheProdukt(
      depoId,
      produktId
    );

    if (!inventar) {
      inventar = await this.inventarRepository.krijim({
        depo_id: depoId,
        produkt_id: produktId,
        sasia: 0,
        sasia_minimale: 0,
      });
    }

    // Rrit stokun
    const sasiaRe = Number(inventar.sasia) + sasia;
    await this.inventarRepository.perditesim(inventar.id, {
      sasia: sasiaRe,
    });

    // Krijo transaksion
    // Nëse referenceType është dhënë (p.sh. POROSI_FURNIZIMI), përdor atë
    // Përndryshe, përdor OTHER dhe ruaj furnitor_id në reference_id (nëse ekziston)
    await this.transaksionRepository.krijim({
      inventar_id: inventar.id,
      tipi: TransaksionTipi.RECEIPT,
      sasia_delta: sasia,
      reference_type: referenceType || ReferenceType.OTHER,
      reference_id: referenceId || finalFurnitorId || null,
      created_by: createdBy,
    });

    // Kontrollo stok minimal dhe krijo alarm nëse është e nevojshme
    await this.kontrolloStokMinimal(inventar.id);

    // Krijo njoftim për magazininierët nëse pranimi është bërë nga menaxheri
    // Kontrollo nëse përdoruesi që bëri pranimin është menaxher
    const perdoruesi = await Perdorues.findByPk(createdBy);
    if (perdoruesi) {
      const perdoruesMeRolet = await Perdorues.findByPk(createdBy, {
        include: [
          {
            model: Rol,
            as: "rolet",
            through: { attributes: [] },
          },
        ],
      });

      const rolet = (perdoruesMeRolet as any)?.rolet?.map((r: Rol) => r.name) || [];
      const eshteMenaxher = rolet.includes(RoleName.MENAXHER) || rolet.includes(RoleName.ADMIN);

      if (eshteMenaxher) {
        // Merr detajet e produktit, depon dhe furnitorin
        const produkt = await Produkt.findByPk(produktId);
        const depo = await Depo.findByPk(depoId);
        let furnitor: Furnitor | null = null;
        if (finalFurnitorId) {
          furnitor = await Furnitor.findByPk(finalFurnitorId);
        }

        // Gjej të gjithë magazininierët
        const rolMagazinier = await Rol.findOne({ where: { name: RoleName.MAGAZINIER } });
        if (rolMagazinier) {
          const magazininieret = await Perdorues.findAll({
            include: [
              {
                model: Rol,
                as: "rolet",
                through: { attributes: [] },
                where: { id: rolMagazinier.id },
              },
            ],
            where: { is_active: true },
          });

          // Krijo njoftim për secilin magazinier
          const produktEmer = produkt?.emer || `Produkt #${produktId}`;
          const depoEmer = depo?.emer || `Depo #${depoId}`;
          const furnitorEmerText = furnitor?.emer || (furnitorEmer || "N/A");

          for (const magazinier of magazininieret) {
            await this.njoftimRepository.krijim({
              perdorues_id: magazinier.id,
              tipi: NjoftimTipi.SYSTEM_ALERT,
              titulli: "Pranim i Ri i Mallit",
              mesazhi: `Menaxheri ka pranuar mall të ri:\n\n` +
                `📦 Produkt: ${produktEmer}\n` +
                `📊 Sasia: ${sasia} njësi\n` +
                `🏢 Depo: ${depoEmer}\n` +
                `🏭 Furnitor: ${furnitorEmerText}\n\n` +
                `Stoku aktual në depo: ${sasiaRe} njësi`,
              is_read: false,
            });
          }
        }
      }
    }

    return await this.inventarRepository.gjejNgaId(inventar.id);
  }

  async kontrolloSasine(produktId: number, depoId: number): Promise<number> {
    const inventar = await this.inventarRepository.gjejPerDepoDheProdukt(
      depoId,
      produktId
    );
    return inventar ? Number(inventar.sasia) : 0;
  }

  async gjejDepoMeStokPerProdukt(produktId: number, sasiaMinimale: number = 0) {
    return await this.inventarRepository.gjejDepoMeStokPerProdukt(produktId, sasiaMinimale);
  }

  async perditesimStok(
    depoId: number,
    produktId: number,
    sasia: number,
    createdBy: number
  ) {
    const inventar = await this.inventarRepository.gjejPerDepoDheProdukt(
      depoId,
      produktId
    );

    if (!inventar) {
      throw new Error("Inventari nuk u gjet");
    }

    const delta = sasia - Number(inventar.sasia);

    await this.inventarRepository.perditesim(inventar.id, { sasia });

    await this.transaksionRepository.krijim({
      inventar_id: inventar.id,
      tipi: TransaksionTipi.ADJUSTMENT,
      sasia_delta: delta,
      reference_type: ReferenceType.OTHER,
      reference_id: null,
      created_by: createdBy,
    });

    // Kontrollo stok minimal pas përditësimit
    await this.kontrolloStokMinimal(inventar.id);

    return await this.inventarRepository.gjejNgaId(inventar.id);
  }

  async gjejProdukteMeStokMinimal() {
    const inventari = await this.inventarRepository.gjejTeGjithaMeDetaje();
    return inventari.filter(
      (inv) => Number(inv.sasia) <= Number(inv.sasia_minimale)
    );
  }

  async kontrolloStokMinimal(inventarId: number) {
    const inventar = await this.inventarRepository.gjejNgaId(inventarId);
    if (!inventar) return;

    if (Number(inventar.sasia) <= Number(inventar.sasia_minimale)) {
      // Krijo njoftim për stok minimal
      await this.njoftimRepository.krijim({
        perdorues_id: null, // Për të gjithë menaxherët
        tipi: NjoftimTipi.LOW_STOCK,
        titulli: "Stok Minimal",
        mesazhi: `Produkti ${(inventar as any).produkt?.emer || "N/A"} ka stok minimal në depo ${(inventar as any).depo?.emer || "N/A"}`,
        is_read: false,
      });
    }
  }

  async transferoProdukte(
    produktId: number,
    fromDepoId: number,
    toDepoId: number,
    sasia: number,
    createdBy: number
  ) {
    // Validim: Depo burimore dhe destinacion nuk mund të jenë të njëjta
    if (fromDepoId === toDepoId) {
      throw new Error("Depo burimore dhe destinacion nuk mund të jenë të njëjta");
    }

    // Validim: Sasia duhet të jetë më e madhe se 0
    if (sasia <= 0) {
      throw new Error("Sasia duhet të jetë më e madhe se 0");
    }

    // Verifiko stokun në depo burimore
    const inventarFrom = await this.inventarRepository.gjejPerDepoDheProdukt(
      fromDepoId,
      produktId
    );

    if (!inventarFrom || Number(inventarFrom.sasia) < sasia) {
      throw new Error("Stoku nuk është i mjaftueshëm në depo burimore");
    }

    // Krijo transfer
    const transfer = await this.transferRepository.krijim({
      produkt_id: produktId,
      from_depo_id: fromDepoId,
      to_depo_id: toDepoId,
      sasia,
      status: TransferStatus.PENDING,
      created_by: createdBy,
    });

    // Ul stokun në depo burimore
    const sasiaFrom = Number(inventarFrom.sasia) - sasia;
    await this.inventarRepository.perditesim(inventarFrom.id, {
      sasia: sasiaFrom,
    });

    await this.transaksionRepository.krijim({
      inventar_id: inventarFrom.id,
      tipi: TransaksionTipi.TRANSFER_OUT,
      sasia_delta: -sasia,
      reference_type: ReferenceType.TRANSFER,
      reference_id: transfer.id,
      created_by: createdBy,
    });

    // Kontrollo stok minimal në depo burimore pas transferit
    await this.kontrolloStokMinimal(inventarFrom.id);

    // Rrit stokun në depo destinacion
    let inventarTo = await this.inventarRepository.gjejPerDepoDheProdukt(
      toDepoId,
      produktId
    );

    if (!inventarTo) {
      inventarTo = await this.inventarRepository.krijim({
        depo_id: toDepoId,
        produkt_id: produktId,
        sasia: 0,
        sasia_minimale: Number(inventarFrom.sasia_minimale),
      });
    }

    const sasiaTo = Number(inventarTo.sasia) + sasia;
    await this.inventarRepository.perditesim(inventarTo.id, {
      sasia: sasiaTo,
    });

    await this.transaksionRepository.krijim({
      inventar_id: inventarTo.id,
      tipi: TransaksionTipi.TRANSFER_IN,
      sasia_delta: sasia,
      reference_type: ReferenceType.TRANSFER,
      reference_id: transfer.id,
      created_by: createdBy,
    });

    // Kontrollo stok minimal në depo destinacion (edhe pse rritet, mund të jetë ende nën minimum)
    await this.kontrolloStokMinimal(inventarTo.id);

    // Përditëso statusin e transferit
    await this.transferRepository.perditesim(transfer.id, {
      status: TransferStatus.COMPLETED,
    });

    return await this.transferRepository.gjejNgaId(transfer.id);
  }
}