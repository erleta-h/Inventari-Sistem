import { BaseRepository } from "./BaseRepository";
import { Produkt } from "../models/Produkt";

export class ProduktRepository extends BaseRepository<Produkt> {
  constructor() {
    super(Produkt);
  }

  async gjejMeSku(sku: string): Promise<Produkt | null> {
    return await this.gjejNgaKusht({ sku });
  }

  async gjejTeGjitheAktiv(): Promise<Produkt[]> {
    return await this.gjejTeGjitha({
      where: { is_active: true },
    });
  }
}