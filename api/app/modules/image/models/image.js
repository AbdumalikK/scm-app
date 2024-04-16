import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'none',
    required: true
  },
  data: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    default: 'none',
    required: true
  },
  encoding: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('image', ImageSchema);