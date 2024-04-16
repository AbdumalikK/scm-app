import mongoose from 'mongoose';

const UserBlockSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
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

export default mongoose.model('user-block', UserBlockSchema);