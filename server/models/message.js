import mongoose from 'mongoose';

const msgSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    prompt: { type: String, required: true },
    reply:  { type: String, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);


msgSchema.index({ userId: 1, createdAt: -1 });

export const Message = mongoose.model('Message', msgSchema);