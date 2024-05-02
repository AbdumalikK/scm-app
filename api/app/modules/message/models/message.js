import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  message: {
    mimetype: {
      type: String,
      default: null
    },
    data: {
      type: String,
      default: null
    },
    payload: {
      type: String,
      default: null 
    }
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

MessageSchema.statics.createFields = [ 'senderId', 'recipientId', 'chatId', 'message' ]

export default mongoose.model('message', MessageSchema)