import mongoose from 'mongoose';

const UserFollowSchema = new mongoose.Schema({
  type: {
    type: String,
    default: null, // following | followers
    required: true
  },
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

export default mongoose.model('user-follow', UserFollowSchema);