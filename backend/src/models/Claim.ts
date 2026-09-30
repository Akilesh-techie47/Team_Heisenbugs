import mongoose, { Schema, model } from 'mongoose';

// Claim schema mirrors the existing LostFound+ claim object including the
// multi-signal evidence block and timeline. Statuses stay compatible with
// the current workflow: PENDING / APPROVED / REJECTED / COMPLETED.
export interface IClaim {
  id: string;
  itemId?: string;
  itemTitle?: string;
  itemCategory?: string;
  claimantId?: string;
  claimantName?: string;
  claimantEmail?: string;
  claimantPhone?: string;
  finderName?: string;
  dropOffLocation?: string;
  status?: string;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  handoverOtp?: string;
  qrCodeString?: string;
  evidence?: Record<string, unknown>;
  proofSubmitted?: string;
  adminNotes?: string;
  timeline?: Array<{ step?: string; date?: string; completed?: boolean }>;
  createdAt?: string;
}

const TimelineStepSchema = new Schema(
  {
    step: { type: String },
    date: { type: String },
    completed: { type: Boolean },
  },
  { _id: false }
);

const ClaimSchema = new Schema<IClaim>({
  id: { type: String, required: true, unique: true },
  itemId: { type: String },
  itemTitle: { type: String },
  itemCategory: { type: String },
  claimantId: { type: String },
  claimantName: { type: String },
  claimantEmail: { type: String },
  claimantPhone: { type: String },
  finderName: { type: String },
  dropOffLocation: { type: String },
  status: { type: String },
  reviewedBy: { type: Schema.Types.Mixed },
  reviewedAt: { type: Schema.Types.Mixed },
  handoverOtp: { type: String },
  qrCodeString: { type: String },
  evidence: { type: Schema.Types.Mixed },
  proofSubmitted: { type: String },
  adminNotes: { type: String },
  timeline: { type: [TimelineStepSchema], default: undefined },
  createdAt: { type: String },
});

ClaimSchema.index({ itemId: 1 });
ClaimSchema.index({ claimantId: 1 });
ClaimSchema.index({ status: 1 });

export const Claim =
  mongoose.models.Claim || model<IClaim>('Claim', ClaimSchema);
