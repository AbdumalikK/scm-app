import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  note: {
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

ReportSchema.statics.createFields = [ 'postId', 'type', 'note' ]


export default mongoose.model('report', ReportSchema)