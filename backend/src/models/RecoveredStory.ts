import mongoose, { Schema, model } from 'mongoose';

// Recovered "Hall of Fame" story mirroring the existing story object.
export interface IRecoveredStory {
  id: string;
  title?: string;
  category?: string;
  owner?: string;
  finder?: string;
  timeToRecover?: string;
  date?: string;
  testimonial?: string;
  badge?: string;
}

const RecoveredStorySchema = new Schema<IRecoveredStory>({
  id: { type: String, required: true, unique: true },
  title: { type: String },
  category: { type: String },
  owner: { type: String },
  finder: { type: String },
  timeToRecover: { type: String },
  date: { type: String },
  testimonial: { type: String },
  badge: { type: String },
});

export const RecoveredStory =
  mongoose.models.RecoveredStory ||
  model<IRecoveredStory>('RecoveredStory', RecoveredStorySchema);
