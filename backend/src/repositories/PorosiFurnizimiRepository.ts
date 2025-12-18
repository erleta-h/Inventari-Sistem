import { BaseRepository } from "./BaseRepository";
import { PorosiFurnizimi } from "../models/PorosiFurnizimi";
import { Furnitor } from "../models/Furnitor";
import { Depo } from "../models/Depo";
import { ArtikullPorosiFurnizimi } from "../models/ArtikullPorosiFurnizimi";
import { Produkt } from "../models/Produkt";

export class PorosiFurnizimiRepository extends BaseRepository<PorosiFurnizimi> {
  constructor() {
    super(PorosiFurnizimi);
  }

  async gjejMeDetaje(id: number): Promise<PorosiFurnizimi | null> {
    return await this.gjejNgaId(id, {
      include: [
        {
          model: Furnitor,
          as: "furnitor",
        },
        {
          model: Depo,
          as: "depo",
        },
        {
          model: ArtikullPorosiFurnizimi,
          as: "artikujt",
          include: [
            {
              model: Produkt,
              as: "produkt",
            },
          ],
        },
      ],
    });
  }

  async gjejTeGjithaMeDetaje(): Promise<PorosiFurnizimi[]> {
    return await this.gjejTeGjitha({
      include: [
        {
          model: Furnitor,
          as: "furnitor",
        },
        {
          model: Depo,
          as: "depo",
        },
        {
          model: ArtikullPorosiFurnizimi,
          as: "artikujt",
          include: [
            {
              model: Produkt,
              as: "produkt",
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });
  }
}