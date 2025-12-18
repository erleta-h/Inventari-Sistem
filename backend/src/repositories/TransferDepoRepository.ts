import { BaseRepository } from "./BaseRepository";
import { TransferDepo } from "../models/TransferDepo";
import { Produkt } from "../models/Produkt";
import { Depo } from "../models/Depo";

export class TransferDepoRepository extends BaseRepository<TransferDepo> {
  constructor() {
    super(TransferDepo);
  }

  async gjejTeGjithaMeDetaje(): Promise<TransferDepo[]> {
    return await this.gjejTeGjitha({
      include: [
        {
          model: Produkt,
          as: "produkt",
        },
        {
          model: Depo,
          as: "nga_depo",
        },
        {
          model: Depo,
          as: "te_depo",
        },
      ],
      order: [["created_at", "DESC"]],
    });
  }
}