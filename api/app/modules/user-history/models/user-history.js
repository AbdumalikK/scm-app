import mongoose from 'mongoose';

const UserHistorySchema = new mongoose.Schema({
  userFirstName: {
    type: String,
    default: null
  },
  userLastName: {
    type: String,
    default: null
  },
  userUsername: {
    type: String,
    required: true
  },
  userAvaUri: {
    type: String,
    default: null
  },
  mediaUri: {
    type: String,
    required: true
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
}, { timestamps: true });

export default mongoose.model('user_history', UserHistorySchema);