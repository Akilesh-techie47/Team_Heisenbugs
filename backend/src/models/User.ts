import mongoose, { Schema, model } from 'mongoose';

// User schema mirrors the existing LostFound+ user object so the
// authentication API contract (register/login/me) stays unchanged.
// Public API identifiers use the string `id` field (e.g. 'USR-001');
// MongoDB ObjectIds are internal only and stripped from responses.
export interface IUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  roleLabel?: string;
  department?: string;
  avatar?: string;
  phone?: string;
  activeReportsCount?: number;
  recoveredCount?: number;
  createdAt?: string;
}

const UserSchema = new Schema<IUser>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true, default: 'USER' },
  roleLabel: { type: String },
  department: { type: String },
  avatar: { type: String },
  phone: { type: String },
  activeReportsCount: { type: Number, default: 0 },
  recoveredCount: { type: Number, default: 0 },
  createdAt: { type: String },
});

// Unique constraints on id/email already create indexes; no extras needed.
export const User = mongoose.models.User || model<IUser>('User', UserSchema);
