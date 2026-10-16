import mongoose from 'mongoose';
const { Schema } = mongoose;

// Embedded: a budget has a small list of lines
const budgetItemSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  categoryId: { type: Schema.Types.ObjectId, default: null },
  kind: { type: String, enum: ['fixed', 'variable', 'savings'], default: 'variable' },
  frequency: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
  // What the user typed, e.g. 25,000,000 kobo per year
  sourceAmount: { type: Number, default: null, min: 0 },
  // Monthly amount the app uses, e.g. 2,083,333 kobo
  plannedAmount: { type: Number, required: true, min: 0 },
});

const budgetSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    periodStart: { type: Date, required: true }, // UTC midnight of the first day
    periodEnd: { type: Date, required: true },
    incomeAmount: { type: Number, default: 0, min: 0 },
    savingsTarget: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft' },
    items: [budgetItemSchema],
  },
  { timestamps: true }
);

budgetSchema.index({ userId: 1, periodStart: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);
