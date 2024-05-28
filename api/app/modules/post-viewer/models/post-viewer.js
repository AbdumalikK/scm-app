import mongoose from 'mongoose';

const PostViewerSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
}, { timestamps: true })

export default mongoose.model('post_viewer', PostViewerSchema)