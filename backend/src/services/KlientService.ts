import { KlientRepository } from "../repositories/KlientRepository";
import { Klient, KlientTipi } from "../models/Klient";

export class KlientService {
  private klientRepository: KlientRepository;

  constructor() {
    this.klientRepository = new KlientRepository();
  }

  async listoKlientet() {
    return await this.klientRepository.gjejTeGjitheAktiv();
  }

  async merrKlient(id: number) {
    return await this.klientRepository.gjejNgaId(id);
  }

  async krijoKlient(data: {
    emer: string;
    tipi: KlientTipi;
    email?: string | null;
    telefoni?: string | null;
    adresa?: string | null;
    qyteti?: string | null;
    shteti?: string | null;
    is_active?: boolean;
  }): Promise<Klient> {
    return await this.klientRepository.krijim({
      emer: data.emer,
      tipi: data.tipi,
      email: data.email ?? null,
      telefoni: data.telefoni ?? null,
      adresa: data.adresa ?? null,
      qyteti: data.qyteti ?? null,
      shteti: data.shteti ?? null,
      is_active: data.is_active ?? true,
    });
  }

  async perditesoKlient(
    id: number,
    data: Partial<{
      emer: string;
      tipi: KlientTipi;
      email: string | null;
      telefoni: string | null;
      adresa: string | null;
      qyteti: string | null;
      shteti: string | null;
      is_active: boolean;
    }>
  ) {
    await this.klientRepository.perditesim(id, data);
    return await this.klientRepository.gjejNgaId(id);
  }

  async fshiKlient(id: number) {
    return await this.klientRepository.fshirje(id);
  }
}







