import { AuditLogRepository } from "../repositories/AuditLogRepository";

export interface AuditLogData {
  perdorues_id: number;
  action: string;
  details?: string;
  entity_type?: string;
  entity_id?: number;
}

export class AuditLogService {
  private auditLogRepository: AuditLogRepository;

  constructor() {
    this.auditLogRepository = new AuditLogRepository();
  }

  async log(data: AuditLogData) {
    return await this.auditLogRepository.krijim({
      perdorues_id: data.perdorues_id,
      action: data.action,
      metadata: data.details ? JSON.stringify({ details: data.details }) : null,
      entity_type: data.entity_type || null,
      entity_id: data.entity_id || null,
    });
  }

  async listoAuditLogs() {
    return await this.auditLogRepository.gjejTeGjithaMeDetaje();
  }
}


