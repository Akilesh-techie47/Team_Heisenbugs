import mongoose, { Schema, model } from 'mongoose';

// Match schema stores smart-similarity engine outputs (potential matches
// only — never confirmed ownership). Matching logic itself is unchanged;
// MongoDB only persists the results.
export interface IMatch {
  id: string;
  lostItemId?: string;
  foundItemId?: string;
  confidenceScore?: number;
  status?: string;
  matchedOn?: string[];
  notes?: string;
  detectedAt?: string;
}

const MatchSchema = new Schema<IMatch>({
  id: { type: String, required: true, unique: true },
  lostItemId: { type: String },
  foundItemId: { type: String },
  confidenceScore: { type: Number },
  status: { type: String },
  matchedOn: { type: [String], default: undefined },
  notes: { type: String },
  detectedAt: { type: String },
});

export const Match =
  mongoose.models.Match || model<IMatch>('Match', MatchSchema);
