import mongoose from 'mongoose';

const SystemWalletSchema = new mongoose.Schema({
  name: {
    type: String,
    default: null
  },
  coin: {
    type: Number,
    default: 0
  },
  deletedAt: {
    type: Date,
    default: null
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

export default mongoose.model('system_wallet', SystemWalletSchema)