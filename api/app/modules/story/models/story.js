import mongoose from 'mongoose';

const StorySchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  comment: [{
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    createdAt: {
      type: Date,
      required: true
    },
    payload: {
      type: String,
      default: null
    },
    active: {
      type: Boolean,
      default: true
    },
    deletedAt: {
      type: Date,
      default: null
    }
  }],
  like: [{
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    createdAt: {
      type: Date,
      required: true
    },
    active: {
      type: Boolean,
      default: true
    },
    deletedAt: {
      type: Date,
      default: null
    }
  }],
  reaction: [{
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    createdAt: { 
      type: Date,
      required: true
    },
    payload: {
      type: String,
      default: null
    },
    active: {
      type: Boolean,
      default: true
    },
    deletedAt: {
      type: Date,
      default: null
    }
  }],
  mediaUri: {
    type: String,
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

export default mongoose.model('story', StorySchema)