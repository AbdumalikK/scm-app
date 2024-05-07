import mongoose from 'mongoose';

const PrivacySchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  private: {
    type: Boolean,
    default: false
  },
  allowSearch: {
    type: Boolean,
    default: true
  },
  showStatus: {
    type: Boolean,
    default: true
  },
  allowComment: {
    type: Number,
		required: true,
		enum: [1, 2, 3], // 1 - noone, 2 - friends, 3 - everyone
    default: 3
  },
  allowMention: {
    type: Number,
		required: true,
		enum: [1, 2, 3], // 1 - noone, 2 - friends, 3 - everyone
    default: 3
  },
  allowDirectMessage: {
    type: Number,
		required: true,
		enum: [1, 2, 3], // 1 - noone, 2 - friends, 3 - everyone
    default: 3
  },
  showFollowList: {
    type: Number,
		required: true,
		enum: [1, 2, 3], // 1 - noone, 2 - friends, 3 - everyone
    default: 3 
  },
  showLikes: {
    type: Number,
		required: true,
		enum: [1, 2, 3], // 1 - noone, 2 - friends, 3 - everyone
    default: 3
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

PrivacySchema.statics.createFields = [ 
	'private', 'allowSearch', 'showStatus', 'allowComment', 'allowMention',
	'allowDirectMessage', 'showFollowList', 'showLikes'
];

export default mongoose.model('privacy', PrivacySchema)