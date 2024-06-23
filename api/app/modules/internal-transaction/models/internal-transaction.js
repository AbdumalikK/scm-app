import mongoose from 'mongoose';

const InternalTransactionSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  senderWalletId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  recipientWalletId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  coin: {
    type: Number,
    required: true
  },
  exchangeRate: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  p2p: {
    type: Boolean,
    default: false
  },
  p2tv: {
    type: Boolean,
    default: false
  },
  amount: {
    type: Number,
    required: true
  }
}, { timestamps: true })

export default mongoose.model('internal_transaction', InternalTransactionSchema)