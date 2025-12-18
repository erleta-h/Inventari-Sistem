import { ProduktRepository } from "../repositories/ProduktRepository";
import { Produkt } from "../models/Produkt";

export class ProduktService {
  private produktRepository: ProduktRepository;

  constructor() {
    this.produktRepository = new ProduktRepository();
  }

  async listoProduktet() {
    return await this.produktRepository.gjejTeGjitheAktiv();
  }

  async merrProdukt(id: number) {
    return await this.produktRepository.gjejNgaId(id);
  }

  async krijoProdukt(data: {
    emer: string;
    sku: string;
    pershkrimi?: string | null;
    kategori_id?: number | null;
    cmimi_njesi: number;
    stok_minimal_default?: number;
    is_active?: boolean;
  }): Promise<Produkt> {
    return await this.produktRepository.krijim({
      emer: data.emer,
      sku: data.sku,
      pershkrimi: data.pershkrimi ?? null,
      kategori_id: data.kategori_id ?? null,
      cmimi_njesi: data.cmimi_njesi,
      stok_minimal_default: data.stok_minimal_default ?? 0,
      is_active: data.is_active ?? true,
    });
  }

  async perditesoProdukt(
    id: number,
    data: Partial<{
      emer: string;
      sku: string;
      pershkrimi: string | null;
      kategori_id: number | null;
      cmimi_njesi: number;
      stok_minimal_default: number;
      is_active: boolean;
    }>
  ) {
    await this.produktRepository.perditesim(id, data);
    return await this.produktRepository.gjejNgaId(id);
  }

  async fshiProdukt(id: number) {
    return await this.produktRepository.fshirje(id);
  }
}