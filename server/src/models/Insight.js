import mongoose from 'mongoose';
const { Schema } = mongoose;

const insightSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    metrics: { type: Schema.Types.Mixed, required: true }, // numbers the note was based on
    noteText: { type: String, required: true },
    model: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

insightSchema.index({ userId: 1, periodStart: 1, periodEnd: 1 }, { unique: true });

export default mongoose.model('Insight', insightSchema);
