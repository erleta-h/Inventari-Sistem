import { BaseRepository } from "./BaseRepository";
import { TransaksionInventari } from "../models/TransaksionInventari";
import { Inventar } from "../models/Inventar";

export class TransaksionInventariRepository extends BaseRepository<TransaksionInventari> {
  constructor() {
    super(TransaksionInventari);
  }

  async gjejPerInventar(inventarId: number): Promise<TransaksionInventari[]> {
    return await this.gjejTeGjitha({
      where: { inventar_id: inventarId },
      include: [
        {
          model: Inventar,
          as: "inventar",
        },
      ],
      order: [["created_at", "DESC"]],
    });
  }
}






