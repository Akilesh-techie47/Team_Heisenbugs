import mongoose, { Schema, model } from 'mongoose';

// Item schema mirrors the existing LostFound+ item object.
// `type` is 'lost' | 'found'. Date/time fields stay strings to keep the
// exact API format the frontend already consumes. The optional aiAnalysis
// subdocument stores Gemini image-analysis results alongside an item.
export interface IAiAnalysis {
  object?: string;
  brand?: string;
  model?: string;
  color?: string;
  category?: string;
  description?: string;
  visibleText?: string;
  distinctiveFeatures?: string[];
  possibleIdentifiers?: string[];
}

export interface IItem {
  id: string;
  userId?: string;
  type: string;
  title?: string;
  category?: string;
  brand?: string;
  color?: string;
  location?: string;
  building?: string;
  date?: string;
  time?: string;
  image?: string | null;
  description?: string;
  distinguishingFeatures?: string;
  privateVerificationInfo?: string;
  securityQuestion?: string;
  securityAnswer?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  status?: string;
  custodyStatus?: string;
  dropOffLocation?: string;
  rewardOffered?: string;
  aiAnalysis?: IAiAnalysis;
  createdAt?: string;
}

const AiAnalysisSchema = new Schema<IAiAnalysis>(
  {
    object: { type: String },
    brand: { type: String },
    model: { type: String },
    color: { type: String },
    category: { type: String },
    description: { type: String },
    visibleText: { type: String },
    distinctiveFeatures: { type: [String], default: undefined },
    possibleIdentifiers: { type: [String], default: undefined },
  },
  { _id: false }
);

const ItemSchema = new Schema<IItem>({
  id: { type: String, required: true, unique: true },
  userId: { type: String },
  type: { type: String, required: true },
  title: { type: String },
  category: { type: String },
  brand: { type: String },
  color: { type: String },
  location: { type: String },
  building: { type: String },
  date: { type: String },
  time: { type: String },
  image: { type: Schema.Types.Mixed },
  description: { type: String },
  distinguishingFeatures: { type: String },
  privateVerificationInfo: { type: String },
  securityQuestion: { type: String },
  securityAnswer: { type: String },
  contactName: { type: String },
  contactEmail: { type: String },
  contactPhone: { type: String },
  status: { type: String },
  custodyStatus: { type: String },
  dropOffLocation: { type: String },
  rewardOffered: { type: String },
  aiAnalysis: { type: AiAnalysisSchema, required: false },
  createdAt: { type: String },
});

ItemSchema.index({ type: 1 });
ItemSchema.index({ category: 1 });
ItemSchema.index({ status: 1 });
ItemSchema.index({ building: 1 });
ItemSchema.index({ createdAt: 1 });
ItemSchema.index({ userId: 1 });

export const Item = mongoose.models.Item || model<IItem>('Item', ItemSchema);
