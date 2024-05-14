import mongoose from 'mongoose';

const AreaSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  isoCode: {
    type: String,
    required: true
  },
  state: [{
    name: {
      type: String,
      required: true
    },
    city: [{
      type: String,
      default: null
    }]
  }],
  deletedAt: {
    type: Date,
    default: null
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

export default mongoose.model('area', AreaSchema)