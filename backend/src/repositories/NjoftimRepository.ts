import { BaseRepository } from "./BaseRepository";
import { Njoftim } from "../models/Njoftim";
import { Perdorues } from "../models/Perdorues";
import { Op } from "sequelize";
import { RoleName } from "../models/Rol";

export class NjoftimRepository extends BaseRepository<Njoftim> {
  constructor() {
    super(Njoftim);
  }

  async gjejPerPerdorues(perdoruesId: number, rolet: string[] = []): Promise<Njoftim[]> {
    // Njoftimet specifike për përdoruesin
    const kushtet: any = {
      perdorues_id: perdoruesId,
    };

    // Nëse përdoruesi është MENAXHER ose ADMIN, përfshi edhe njoftimet globale (perdorues_id: null)
    const eshteMenaxherOseAdmin = rolet.includes(RoleName.MENAXHER) || rolet.includes(RoleName.ADMIN);
    
    if (eshteMenaxherOseAdmin) {
      kushtet[Op.or] = [
        { perdorues_id: perdoruesId },
        { perdorues_id: null }
      ];
    }

    return await this.gjejTeGjitha({
      where: kushtet,
      include: [
        {
          model: Perdorues,
          as: "perdorues",
          required: false, // LEFT JOIN për të përfshirë njoftimet me perdorues_id: null
        },
      ],
      order: [["created_at", "DESC"]],
    });
  }

  async gjejTePaleksuar(perdoruesId: number, rolet: string[] = []): Promise<Njoftim[]> {
    // Njoftimet specifike për përdoruesin që nuk janë lexuar
    const kushtet: any = {
      is_read: false,
    };

    // Nëse përdoruesi është MENAXHER ose ADMIN, përfshi edhe njoftimet globale (perdorues_id: null)
    const eshteMenaxherOseAdmin = rolet.includes(RoleName.MENAXHER) || rolet.includes(RoleName.ADMIN);
    
    if (eshteMenaxherOseAdmin) {
      kushtet[Op.or] = [
        { perdorues_id: perdoruesId },
        { perdorues_id: null }
      ];
    } else {
      kushtet.perdorues_id = perdoruesId;
    }

    return await this.gjejTeGjitha({
      where: kushtet,
      order: [["created_at", "DESC"]],
    });
  }
}



