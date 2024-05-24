import mongoose from 'mongoose';

const CurrencySchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  exchangeRate: {
    type: Number,
    required: true
  },
}, { timestamps: true })

export default mongoose.model('currency', CurrencySchema)