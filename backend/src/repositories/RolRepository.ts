import { BaseRepository } from "./BaseRepository";
import { Rol } from "../models/Rol";

export class RolRepository extends BaseRepository<Rol> {
  constructor() {
    super(Rol);
  }
}







