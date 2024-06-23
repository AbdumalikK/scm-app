import mongoose from 'mongoose';

const TargetAudienceSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  country: {
    type: String,
    default: null
  },
  city: {
    type: String,
    default: null
  },
  coords: {
    latitude: {
      type: Number,
      default: null
    },
    longitude: {
      type: Number,
      default: null
    },
    attitude: {
      type: Number,
      default: null
    }
  },
  interest: [{
    type: String,
    default: null
  }],
  age: {
    from: {
      type: Number,
      default: null
    },
    to: {
      type: Number,
      default: null
    }
  },
  gender: {
    type: String,
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

TargetAudienceSchema.statics.createFields = [ 
  'country', 'city', 'moreMessages', 'coords', 'interest', 'age',
  'gender'
]

export default mongoose.model('target_audience', TargetAudienceSchema)