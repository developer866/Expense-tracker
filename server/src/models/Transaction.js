import mongoose from 'mongoose';
const { Schema } = mongoose;

const transactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // Created on the phone. Stops duplicates when an offline entry is retried.
    clientId: { type: String },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    // Whole number in the smallest unit (kobo). 2,500 naira = 250000.
    amount: {
      type: Number,
      required: true,
      min: 1,
      validate: { validator: Number.isInteger, message: 'amount must be a whole number' },
    },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    // _id of an entry in user.categories
    categoryId: { type: Schema.Types.ObjectId, default: null },
    note: { type: String, maxlength: 300 },
    occurredAt: { type: Date, required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, occurredAt: -1 });
transactionSchema.index({ userId: 1, categoryId: 1, occurredAt: -1 });
// Unique only when clientId is a string, so entries without one don't collide
transactionSchema.index(
  { userId: 1, clientId: 1 },
  { unique: true, partialFilterExpression: { clientId: { $type: 'string' } } }
);

export default mongoose.model('Transaction', transactionSchema);
