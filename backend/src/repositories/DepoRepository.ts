import { BaseRepository } from "./BaseRepository";
import { Depo } from "../models/Depo";
import { DepoStatus } from "../models/Depo";

export class DepoRepository extends BaseRepository<Depo> {
  constructor() {
    super(Depo);
  }

  async gjejTeGjitheAktiv(): Promise<Depo[]> {
    return await this.gjejTeGjitha({
      where: { status: DepoStatus.AKTIV },
    });
  }
}