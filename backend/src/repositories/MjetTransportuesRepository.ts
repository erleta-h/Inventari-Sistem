import { BaseRepository } from "./BaseRepository";
import { MjetTransportues } from "../models/MjetTransportues";
import { MjetStatus } from "../models/MjetTransportues";

export class MjetTransportuesRepository extends BaseRepository<MjetTransportues> {
  constructor() {
    super(MjetTransportues as unknown as any);
  }

  async gjejTeGjitheAktiv(): Promise<MjetTransportues[]> {
    return await this.gjejTeGjitha({
      where: { is_active: true },
    });
  }

  async gjejTeGjitheDisponueshem(): Promise<MjetTransportues[]> {
    return await this.gjejTeGjitha({
      where: {
        is_active: true,
        status: MjetStatus.AKTIV,
      },
    });
  }
}