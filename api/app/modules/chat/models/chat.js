import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  mute: {
    type: Boolean,
    default: false
  },
  pin: {
    type: Boolean,
    default: false
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
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

ChatSchema.statics.createFields = [ 'senderId', 'recipientId', 'mute', 'pin' ]

export default mongoose.model('chat', ChatSchema)