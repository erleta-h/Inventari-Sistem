import { BaseRepository } from "./BaseRepository";
import { Porosi } from "../models/Porosi";
import { Klient } from "../models/Klient";
import { Depo } from "../models/Depo";
import { ArtikullPorosie } from "../models/ArtikullPorosie";
import { Produkt } from "../models/Produkt";

export class PorosiRepository extends BaseRepository<Porosi> {
  constructor() {
    super(Porosi);
  }

  async gjejMeDetaje(id: number): Promise<Porosi | null> {
    return await this.gjejNgaId(id, {
      include: [
        {
          model: Klient,
          as: "klient",
        },
        {
          model: Depo,
          as: "depo",
        },
        {
          model: ArtikullPorosie,
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

  async gjejTeGjithaMeDetaje(): Promise<Porosi[]> {
    return await this.gjejTeGjitha({
      include: [
        {
          model: Klient,
          as: "klient",
        },
        {
          model: Depo,
          as: "depo",
        },
        {
          model: ArtikullPorosie,
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

  async gjejPerPerdorues(perdoruesId: number): Promise<Porosi[]> {
    return await this.gjejTeGjitha({
      where: { created_by: perdoruesId },
      include: [
        {
          model: Klient,
          as: "klient",
        },
        {
          model: Depo,
          as: "depo",
        },
        {
          model: ArtikullPorosie,
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