import { DepoRepository } from "../repositories/DepoRepository";
import { Depo, DepoStatus } from "../models/Depo";

export class DepoService {
  private depoRepository: DepoRepository;

  constructor() {
    this.depoRepository = new DepoRepository();
  }

  async listoDepot() {
    return await this.depoRepository.gjejTeGjitheAktiv();
  }

  async merrDepo(id: number) {
    return await this.depoRepository.gjejNgaId(id);
  }

  async krijoDepo(data: {
    emer: string;
    kod: string;
    adresa?: string | null;
    kapaciteti?: number;
    status?: DepoStatus;
    is_active?: boolean;
  }): Promise<Depo> {
    return await this.depoRepository.krijim({
      emer: data.emer,
      kod: data.kod,
      adresa: data.adresa ?? null,
      kapaciteti: data.kapaciteti ?? 0,
      status: data.status ?? DepoStatus.AKTIV,
      is_active: data.is_active ?? true,
    });
  }

  async perditesoDepo(
    id: number,
    data: Partial<{
      emer: string;
      kod: string;
      adresa: string | null;
      kapaciteti: number;
      status: DepoStatus;
      is_active: boolean;
    }>
  ) {
    await this.depoRepository.perditesim(id, data);
    return await this.depoRepository.gjejNgaId(id);
  }

  async fshiDepo(id: number) {
    return await this.depoRepository.fshirje(id);
  }
}