import { FurnitorRepository } from "../repositories/FurnitorRepository";
import { Furnitor } from "../models/Furnitor";

export class FurnitorService {
  private furnitorRepository: FurnitorRepository;

  constructor() {
    this.furnitorRepository = new FurnitorRepository();
  }

  async listoFurnitoret() {
    return await this.furnitorRepository.gjejTeGjitheAktiv();
  }

  async merrFurnitor(id: number) {
    return await this.furnitorRepository.gjejNgaId(id);
  }

  async krijoFurnitor(data: {
    emer: string;
    email?: string | null;
    telefoni?: string | null;
    adresa?: string | null;
    qyteti?: string | null;
    shteti?: string | null;
    is_active?: boolean;
  }): Promise<Furnitor> {
    return await this.furnitorRepository.krijim({
      emer: data.emer,
      email: data.email ?? null,
      telefoni: data.telefoni ?? null,
      adresa: data.adresa ?? null,
      qyteti: data.qyteti ?? null,
      shteti: data.shteti ?? null,
      is_active: data.is_active ?? true,
    });
  }

  async perditesoFurnitor(
    id: number,
    data: Partial<{
      emer: string;
      email: string | null;
      telefoni: string | null;
      adresa: string | null;
      qyteti: string | null;
      shteti: string | null;
      is_active: boolean;
    }>
  ) {
    await this.furnitorRepository.perditesim(id, data);
    return await this.furnitorRepository.gjejNgaId(id);
  }

  async fshiFurnitor(id: number) {
    return await this.furnitorRepository.fshirje(id);
  }
}