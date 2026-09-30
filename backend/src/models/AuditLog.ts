import mongoose, { Schema, model } from 'mongoose';

// Immutable audit record for administrative decisions and chain of custody
// (report verified, claim submitted/approved/rejected, recovery confirmed,
// admin login, handover completed, ...).
export interface IAuditLog {
  id: string;
  actor?: string;
  actorId?: string;
  action?: string;
  entity?: string;
  entityId?: string;
  timestamp?: string;
  details?: string;
  result?: string;
}

const AuditLogSchema = new Schema<IAuditLog>({
  id: { type: String, required: true, unique: true },
  actor: { type: String },
  actorId: { type: String },
  action: { type: String },
  entity: { type: String },
  entityId: { type: String },
  timestamp: { type: String },
  details: { type: String },
  result: { type: String },
});

AuditLogSchema.index({ action: 1 });

export const AuditLog =
  mongoose.models.AuditLog || model<IAuditLog>('AuditLog', AuditLogSchema);
