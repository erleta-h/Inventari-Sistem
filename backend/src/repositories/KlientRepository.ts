import { BaseRepository } from "./BaseRepository";
import { Klient } from "../models/Klient";

export class KlientRepository extends BaseRepository<Klient> {
  constructor() {
    super(Klient);
  }

  async gjejTeGjitheAktiv(): Promise<Klient[]> {
    return await this.gjejTeGjitha({
      where: { is_active: true },
    });
  }
}






