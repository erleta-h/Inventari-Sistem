import { DergeseRepository } from "../repositories/DergeseRepository";
import { PorosiRepository } from "../repositories/PorosiRepository";
import { MjetTransportuesRepository } from "../repositories/MjetTransportuesRepository";
import { PerdoruesRepository } from "../repositories/PerdoruesRepository";
import { Dergese, DergeseStatus } from "../models/Dergese";
import { MjetStatus } from "../models/MjetTransportues";
import { NjoftimRepository } from "../repositories/NjoftimRepository";
import { Njoftim, NjoftimTipi } from "../models/Njoftim";
import { Op } from "sequelize";

export class DeliveryService {
  private dergeseRepository: DergeseRepository;
  private porosiRepository: PorosiRepository;
  private mjetRepository: MjetTransportuesRepository;
  private perdoruesRepository: PerdoruesRepository;
  private njoftimRepository: NjoftimRepository;

  constructor() {
    this.dergeseRepository = new DergeseRepository();
    this.porosiRepository = new PorosiRepository();
    this.mjetRepository = new MjetTransportuesRepository();
    this.perdoruesRepository = new PerdoruesRepository();
    this.njoftimRepository = new NjoftimRepository();
  }

  async krijimDergese(porosiId: number): Promise<Dergese> {
    const porosi = await this.porosiRepository.gjejNgaId(porosiId);
    if (!porosi) {
      throw new Error("Porosia nuk u gjet");
    }

    // Verifiko që porosia është gati për nisje
    if ((porosi as any).status !== "READY_FOR_SHIPPING") {
      throw new Error("Porosia duhet të jetë READY_FOR_SHIPPING për të krijuar dërgesë");
    }

    const dergese = await this.dergeseRepository.krijim({
      porosi_id: porosiId,
      shofer_id: null,
      mjet_id: null,
      status: DergeseStatus.PLANNED,
      arsye_deshtimi: null,
      started_at: null,
      delivered_at: null,
      last_known_lat: null,
      last_known_lng: null,
    });

    const dergeseMeDetaje = await this.dergeseRepository.gjejMeDetaje(dergese.id);
    if (!dergeseMeDetaje) {
      throw new Error("Dërgesa nuk u gjet pas krijimit");
    }
    return dergeseMeDetaje;
  }

  async caktoShofer(
    dergeseId: number,
    shoferId: number,
    mjetId: number
  ): Promise<Dergese> {
    const dergese = await this.dergeseRepository.gjejNgaId(dergeseId);
    if (!dergese) {
      throw new Error("Dërgesa nuk u gjet");
    }

    // Verifiko disponueshmërinë e mjetit
    const mjet = await this.mjetRepository.gjejNgaId(mjetId);
    if (!mjet || !mjet.is_active) {
      throw new Error("Mjeti nuk u gjet ose nuk është aktiv");
    }

    if (mjet.status !== MjetStatus.AKTIV) {
      throw new Error(
        `Mjeti nuk është i disponueshëm. Statusi aktual: ${mjet.status}`
      );
    }

    // Verifiko shoferin
    const shofer = await this.perdoruesRepository.gjejNgaId(shoferId);
    if (!shofer || !shofer.is_active) {
      throw new Error("Shoferi nuk u gjet ose nuk është aktiv");
    }

    await this.dergeseRepository.perditesim(dergeseId, {
      shofer_id: shoferId,
      mjet_id: mjetId,
      status: DergeseStatus.ON_THE_WAY,
      started_at: new Date(),
    });

    // Krijo njoftim për shoferin
    const dergeseMeDetaje = await this.dergeseRepository.gjejMeDetaje(dergeseId);
    if (dergeseMeDetaje?.porosi) {
      await this.njoftimRepository.krijim({
        perdorues_id: shoferId,
        tipi: NjoftimTipi.SYSTEM_ALERT,
        titulli: "Dërgesë e Re",
        mesazhi: `Ju është caktuar një dërgesë e re për porosinë #${dergeseMeDetaje.porosi_id}. Klienti: ${dergeseMeDetaje.porosi.klient?.emer || "N/A"}`,
        is_read: false,
      });
    }

    if (!dergeseMeDetaje) {
      throw new Error("Dërgesa nuk u gjet pas përditësimit");
    }
    return dergeseMeDetaje;
  }

  async perditesimStatusDergese(
    dergeseId: number,
    status: DergeseStatus,
    arsyeDeshtimi?: string
  ): Promise<Dergese> {
    const updateData: any = { status };
    if (arsyeDeshtimi) {
      updateData.arsye_deshtimi = arsyeDeshtimi;
    }
    if (status === DergeseStatus.DELIVERED) {
      updateData.delivered_at = new Date();
    }

    await this.dergeseRepository.perditesim(dergeseId, updateData);

    // Nëse dërgesa dështon, krijo njoftim
    if (status === DergeseStatus.FAILED) {
      const dergese = await this.dergeseRepository.gjejMeDetaje(dergeseId);
      await this.njoftimRepository.krijim({
        perdorues_id: null,
        tipi: NjoftimTipi.DELIVERY_ALERT,
        titulli: "Dërgesa Dështoi",
        mesazhi: `Dërgesa për porosinë #${dergese?.porosi_id} dështoi. Arsyeja: ${arsyeDeshtimi || "N/A"}`,
        is_read: false,
      });
    }

    const dergeseMeDetaje = await this.dergeseRepository.gjejMeDetaje(dergeseId);
    if (!dergeseMeDetaje) {
      throw new Error("Dërgesa nuk u gjet pas përditësimit");
    }
    return dergeseMeDetaje;
  }

  async gjurmoDergese(dergeseId: number) {
    const dergeseMeDetaje = await this.dergeseRepository.gjejMeDetaje(dergeseId);
    if (!dergeseMeDetaje) {
      throw new Error("Dërgesa nuk u gjet pas përditësimit");
    }
    return dergeseMeDetaje;
  }

  async perditesimPozicion(
    dergeseId: number,
    lat: number,
    lng: number
  ): Promise<Dergese> {
    await this.dergeseRepository.perditesim(dergeseId, {
      last_known_lat: lat,
      last_known_lng: lng,
    });

    const dergeseMeDetaje = await this.dergeseRepository.gjejMeDetaje(dergeseId);
    if (!dergeseMeDetaje) {
      throw new Error("Dërgesa nuk u gjet pas përditësimit");
    }
    return dergeseMeDetaje;
  }

  async gjejDergesatPerShofer(shoferId: number, vetemSot: boolean = false) {
    const dergesat = await this.dergeseRepository.gjejPerShofer(shoferId);
    
    if (vetemSot) {
      const sot = new Date();
      sot.setHours(0, 0, 0, 0);
      const neser = new Date(sot);
      neser.setDate(neser.getDate() + 1);
      
      return dergesat.filter(dergesa => {
        const dataKrijimit = new Date(dergesa.created_at);
        return dataKrijimit >= sot && dataKrijimit < neser;
      });
    }
    
    return dergesat;
  }

  async listoDergesat() {
    return await this.dergeseRepository.gjejTeGjithaMeDetaje();
  }

  async gjejShoferetEDisponueshem(limitDergesat: number = 5): Promise<number[]> {
    // Gjej të gjitha dërgesat e sotme që kanë shofer
    const sot = new Date();
    sot.setHours(0, 0, 0, 0);
    const neser = new Date(sot);
    neser.setDate(neser.getDate() + 1);

    const dergesatSot = await this.dergeseRepository.gjejTeGjitha({
      where: {
        created_at: {
          [Op.gte]: sot,
          [Op.lt]: neser,
        },
        shofer_id: {
          [Op.ne]: null,
        },
      },
    });

    // Numëro dërgesat për çdo shofer
    const numriDergesavePerShofer: Record<number, number> = {};
    dergesatSot.forEach((dergesa) => {
      if (dergesa.shofer_id) {
        numriDergesavePerShofer[dergesa.shofer_id] =
          (numriDergesavePerShofer[dergesa.shofer_id] || 0) + 1;
      }
    });

    // Gjej ID-të e shoferëve që kanë më shumë se limiti
    const shoferetTeZene = Object.keys(numriDergesavePerShofer)
      .filter(
        (shoferId) =>
          numriDergesavePerShofer[Number(shoferId)] >= limitDergesat
      )
      .map((id) => Number(id));

    return shoferetTeZene;
  }
}

