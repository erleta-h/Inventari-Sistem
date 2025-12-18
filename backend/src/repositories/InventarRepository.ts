import { BaseRepository } from "./BaseRepository";
import { Inventar } from "../models/Inventar";
import { Produkt } from "../models/Produkt";
import { Depo } from "../models/Depo";
import { Op } from "sequelize";

export class InventarRepository extends BaseRepository<Inventar> {
  constructor() {
    super(Inventar);
  }

  async gjejPerDepoDheProdukt(
    depoId: number,
    produktId: number
  ): Promise<Inventar | null> {
    return await this.gjejNgaKusht({
      depo_id: depoId,
      produkt_id: produktId,
    });
  }

  async gjejTeGjithaMeDetaje(): Promise<Inventar[]> {
    return await this.gjejTeGjitha({
      include: [
        {
          model: Depo,
          as: "depo",
        },
        {
          model: Produkt,
          as: "produkt",
        },
      ],
    });
  }

  async gjejPerDepo(depoId: number): Promise<Inventar[]> {
    return await this.gjejTeGjitha({
      where: { depo_id: depoId },
      include: [
        {
          model: Produkt,
          as: "produkt",
        },
      ],
    });
  }

  async gjejDepoMeStokPerProdukt(produktId: number, sasiaMinimale: number = 0): Promise<Inventar[]> {
    return await this.gjejTeGjitha({
      where: {
        produkt_id: produktId,
        sasia: {
          [Op.gt]: sasiaMinimale,
        },
      },
      include: [
        {
          model: Depo,
          as: "depo",
        },
        {
          model: Produkt,
          as: "produkt",
        },
      ],
    });
  }
}