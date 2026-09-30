import mongoose, { Schema, model } from 'mongoose';

// Per-user notification schema mirroring the existing notification object.
export interface INotification {
  id: string;
  userId?: string;
  type?: string;
  title?: string;
  message?: string;
  read?: boolean;
  link?: string;
  createdAt?: string;
}

const NotificationSchema = new Schema<INotification>({
  id: { type: String, required: true, unique: true },
  userId: { type: String },
  type: { type: String },
  title: { type: String },
  message: { type: String },
  read: { type: Boolean, default: false },
  link: { type: String },
  createdAt: { type: String },
});

NotificationSchema.index({ userId: 1 });
NotificationSchema.index({ read: 1 });

export const Notification =
  mongoose.models.Notification ||
  model<INotification>('Notification', NotificationSchema);
