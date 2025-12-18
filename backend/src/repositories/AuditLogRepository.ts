import { BaseRepository } from "./BaseRepository";
import { AuditLog } from "../models/AuditLog";

export class AuditLogRepository extends BaseRepository<AuditLog> {
  constructor() {
    super(AuditLog);
  }

  async gjejTeGjithaMeDetaje(): Promise<AuditLog[]> {
    return await this.gjejTeGjitha({
      order: [["created_at", "DESC"]],
      limit: 1000,
    });
  }
}






