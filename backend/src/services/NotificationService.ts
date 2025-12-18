import { NjoftimRepository } from "../repositories/NjoftimRepository";
import { Njoftim, NjoftimTipi } from "../models/Njoftim";

export class NotificationService {
  private njoftimRepository: NjoftimRepository;

  constructor() {
    this.njoftimRepository = new NjoftimRepository();
  }

  async krijimNjoftim(data: {
    perdorues_id?: number | null;
    tipi: NjoftimTipi;
    titulli: string;
    mesazhi: string;
  }): Promise<Njoftim> {
    return await this.njoftimRepository.krijim({
      perdorues_id: data.perdorues_id || null,
      tipi: data.tipi,
      titulli: data.titulli,
      mesazhi: data.mesazhi,
      is_read: false,
    });
  }

  async gjejNjoftimetPerPerdorues(perdoruesId: number, rolet: string[] = []) {
    return await this.njoftimRepository.gjejPerPerdorues(perdoruesId, rolet);
  }

  async gjejNjoftimetTePaleksuar(perdoruesId: number, rolet: string[] = []) {
    return await this.njoftimRepository.gjejTePaleksuar(perdoruesId, rolet);
  }

  async shenoSiLexuar(njoftimId: number) {
    await this.njoftimRepository.perditesim(njoftimId, {
      is_read: true,
    });
  }
}



