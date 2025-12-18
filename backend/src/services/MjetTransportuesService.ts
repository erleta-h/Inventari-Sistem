import { MjetTransportuesRepository } from "../repositories/MjetTransportuesRepository";
import { MjetTransportues, MjetStatus } from "../models/MjetTransportues";

export class MjetTransportuesService {
  private mjetRepository: MjetTransportuesRepository;

  constructor() {
    this.mjetRepository = new MjetTransportuesRepository();
  }

  async listoMjetet() {
    return await this.mjetRepository.gjejTeGjitheAktiv();
  }

  async merrMjet(id: number) {
    return await this.mjetRepository.gjejNgaId(id);
  }

  async krijoMjet(data: {
    targa: string;
    modeli?: string | null;
    kapaciteti?: number | null;
    status?: MjetStatus;
    is_active?: boolean;
  }): Promise<MjetTransportues> {
    return await this.mjetRepository.krijim({
      targa: data.targa,
      modeli: data.modeli ?? null,
      kapaciteti: data.kapaciteti ?? null,
      status: data.status ?? MjetStatus.AKTIV,
      is_active: data.is_active ?? true,
    });
  }

  async perditesoMjet(
    id: number,
    data: Partial<{
      targa: string;
      modeli: string | null;
      kapaciteti: number | null;
      status: MjetStatus;
      is_active: boolean;
    }>
  ) {
    await this.mjetRepository.perditesim(id, data);
    return await this.mjetRepository.gjejNgaId(id);
  }

  async fshiMjet(id: number) {
    return await this.mjetRepository.fshirje(id);
  }
}