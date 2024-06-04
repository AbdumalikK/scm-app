import mongoose from 'mongoose';

const BoostSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  moreProfileVisits: {
      type: Boolean,
      default: false
  },
  moreWebstiteVisits: {
    type: Boolean,
    default: false
  },
  moreMessages: {
    type: Boolean,
    default: false
  },
  actionButton: {
    type: String,
    default: null
  },
  website: {
    type: String,
    default: null
  },
  targetAudienceAuto: {
    type: Boolean,
    default: false
  },
  targetAudienceOwnId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  budget: {
    type: Number,
    default: null
  },
  duration: {
    type: Number,
    default: null
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

BoostSchema.statics.createFields = [ 
  'moreProfileVisits', 'moreWebstiteVisits', 'moreMessages', 'actionButton',
  'website', 'targetAudienceAuto', 'budget', 'duration'
]

export default mongoose.model('boost', BoostSchema)