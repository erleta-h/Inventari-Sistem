import { BaseRepository } from "./BaseRepository";
import { Dergese } from "../models/Dergese";
import { Porosi } from "../models/Porosi";
import { Perdorues } from "../models/Perdorues";
import { MjetTransportues } from "../models/MjetTransportues";
import { Klient } from "../models/Klient";

export class DergeseRepository extends BaseRepository<Dergese> {
  constructor() {
    super(Dergese);
  }

  async gjejMeDetaje(id: number): Promise<Dergese | null> {
    return await this.gjejNgaId(id, {
      include: [
        {
          model: Porosi,
          as: "porosi",
          include: [
            {
              model: Klient,
              as: "klient",
            },
          ],
        },
        {
          model: Perdorues,
          as: "shofer",
        },
        {
          model: MjetTransportues,
          as: "mjet",
        },
      ],
    });
  }

  async gjejTeGjithaMeDetaje(): Promise<Dergese[]> {
    return await this.gjejTeGjitha({
      include: [
        {
          model: Porosi,
          as: "porosi",
          include: [
            {
              model: Klient,
              as: "klient",
            },
          ],
        },
        {
          model: Perdorues,
          as: "shofer",
        },
        {
          model: MjetTransportues,
          as: "mjet",
        },
      ],
      order: [["created_at", "DESC"]],
    });
  }

  async gjejPerShofer(shoferId: number): Promise<Dergese[]> {
    return await this.gjejTeGjitha({
      where: { shofer_id: shoferId },
      include: [
        {
          model: Porosi,
          as: "porosi",
          include: [
            {
              model: Klient,
              as: "klient",
            },
          ],
        },
        {
          model: MjetTransportues,
          as: "mjet",
        },
      ],
      order: [["created_at", "DESC"]],
    });
  }
}



