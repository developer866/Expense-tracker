import mongoose from 'mongoose';
const { Schema } = mongoose;

const supportTicketSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, maxlength: 2000 },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model('SupportTicket', supportTicketSchema);
