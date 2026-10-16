import mongoose from 'mongoose';
const { Schema } = mongoose;

// Embedded: a user has a small, bounded list of categories (each gets its own _id)
const categorySchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 40 },
  kind: { type: String, enum: ['expense', 'income'], default: 'expense' },
  icon: String,
  color: String,
  sortOrder: { type: Number, default: 0 },
  isDefault: { type: Boolean, default: false },
});

// Embedded: reminder times in the user's timezone
const reminderSchema = new Schema({
  hour: { type: Number, required: true, min: 0, max: 23 },
  minute: { type: Number, default: 0, min: 0, max: 59 },
  enabled: { type: Boolean, default: true },
});

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    currency: { type: String, default: 'NGN', uppercase: true, minlength: 3, maxlength: 3 },
    timezone: { type: String, default: 'UTC' },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    monthStartDay: { type: Number, default: 1, min: 1, max: 28 },
    categories: [categorySchema],
    reminders: [reminderSchema],
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
