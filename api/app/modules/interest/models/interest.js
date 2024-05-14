import mongoose from 'mongoose';

const InterestSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    required: true
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

export default mongoose.model('interest', InterestSchema)