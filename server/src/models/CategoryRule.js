import mongoose from 'mongoose';
const { Schema } = mongoose;

// Learned from the user's corrections: "bolt" -> Transport, "salary" -> credit
const categoryRuleSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    keyword: { type: String, required: true, lowercase: true, trim: true, maxlength: 60 },
    categoryId: { type: Schema.Types.ObjectId, default: null },
    type: { type: String, enum: ['credit', 'debit'], default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

categoryRuleSchema.index({ userId: 1, keyword: 1 }, { unique: true });

export default mongoose.model('CategoryRule', categoryRuleSchema);
