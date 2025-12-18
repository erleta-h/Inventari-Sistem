import { BaseRepository } from "./BaseRepository";
import "../models/index"; // Import asociacionet
import { Perdorues } from "../models/Perdorues";
import { Rol } from "../models/Rol";

export class PerdoruesRepository extends BaseRepository<Perdorues> {
  constructor() {
    super(Perdorues);
  }

  async gjejMeEmail(email: string): Promise<Perdorues | null> {
    return await this.gjejNgaKusht({ email });
  }

  async gjejMeRolet(id: number): Promise<Perdorues | null> {
    return await this.gjejNgaId(id, {
      include: [
        {
          model: Rol,
          as: "rolet",
          through: { attributes: [] },
        },
      ],
    });
  }

  async gjejTeGjitheAktiv(): Promise<Perdorues[]> {
    return await this.gjejTeGjitha({
      where: { is_active: true },
      include: [
        {
          model: Rol,
          as: "rolet",
          through: { attributes: [] },
        },
      ],
    });
  }
}

