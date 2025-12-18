import { BaseRepository } from "./BaseRepository";
import { Furnitor } from "../models/Furnitor";

export class FurnitorRepository extends BaseRepository<Furnitor> {
  constructor() {
    super(Furnitor);
  }

  async gjejTeGjitheAktiv(): Promise<Furnitor[]> {
    return await this.gjejTeGjitha({
      where: { is_active: true },
    });
  }
}