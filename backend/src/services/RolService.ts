import { RolRepository } from "../repositories/RolRepository";

export class RolService {
  private rolRepository: RolRepository;

  constructor() {
    this.rolRepository = new RolRepository();
  }

  async listoRolet() {
    return await this.rolRepository.gjejTeGjitha();
  }
}







