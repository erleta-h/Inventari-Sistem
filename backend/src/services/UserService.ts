import { PerdoruesRepository } from "../repositories/PerdoruesRepository";
import { Rol } from "../models/Rol";
import { PerdoruesRol } from "../models/PerdoruesRol";
import { AuthService } from "./AuthService";
import { RoleName } from "../models/Rol";

export class UserService {
  private perdoruesRepository: PerdoruesRepository;
  private authService: AuthService;

  constructor() {
    this.perdoruesRepository = new PerdoruesRepository();
    this.authService = new AuthService();
  }

  async krijimPerdorues(data: {
    emer: string;
    email: string;
    password: string;
    telefoni?: string;
    rolet?: RoleName[];
  }) {
    const ekziston = await this.perdoruesRepository.gjejMeEmail(data.email);
    if (ekziston) {
      throw new Error("Përdoruesi me këtë email ekziston tashmë");
    }

    const passwordHash = await this.authService.hashPassword(data.password);

    const perdorues = await this.perdoruesRepository.krijim({
      emer: data.emer,
      email: data.email,
      password_hash: passwordHash,
      telefoni: data.telefoni || null,
      is_active: true,
    });

    // Cakto rolet
    if (data.rolet && data.rolet.length > 0) {
      const rolet = await Rol.findAll({
        where: { name: data.rolet },
      });

      for (const rol of rolet) {
        await PerdoruesRol.create({
          perdorues_id: perdorues.id,
          rol_id: rol.id,
        });
      }
    }

    return await this.perdoruesRepository.gjejMeRolet(perdorues.id);
  }

  async gjejTeGjithePerdoruesit() {
    return await this.perdoruesRepository.gjejTeGjitheAktiv();
  }

  async gjejPerdorues(id: number) {
    return await this.perdoruesRepository.gjejMeRolet(id);
  }

  async perditesimPerdorues(
    id: number,
    data: {
      emer?: string;
      email?: string;
      telefoni?: string;
      is_active?: boolean;
      rolet?: RoleName[];
    }
  ) {
    const perdorues = await this.perdoruesRepository.gjejNgaId(id);
    if (!perdorues) {
      throw new Error("Përdoruesi nuk u gjet");
    }

    const updateData: any = {};
    if (data.emer) updateData.emer = data.emer;
    if (data.email) updateData.email = data.email;
    if (data.telefoni !== undefined) updateData.telefoni = data.telefoni;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    await this.perdoruesRepository.perditesim(id, updateData);

    // Ndrysho rolet nëse janë dhënë
    if (data.rolet) {
      await PerdoruesRol.destroy({ where: { perdorues_id: id } });

      const rolet = await Rol.findAll({
        where: { name: data.rolet },
      });

      for (const rol of rolet) {
        await PerdoruesRol.create({
          perdorues_id: id,
          rol_id: rol.id,
        });
      }
    }

    return await this.perdoruesRepository.gjejMeRolet(id);
  }

  async fshirjePerdorues(id: number) {
    return await this.perdoruesRepository.fshirje(id);
  }
}






