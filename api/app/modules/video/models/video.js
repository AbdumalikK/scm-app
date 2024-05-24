import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'none',
    required: true
  },
  isTv: {
    type: Boolean,
    default: false
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
  comment: {
    type: String,
    default: null
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

export default mongoose.model('video', VideoSchema);