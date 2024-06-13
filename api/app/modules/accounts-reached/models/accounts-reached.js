import mongoose from 'mongoose';

const AccountsReachedSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
}, { timestamps: true })

export default mongoose.model('accounts_reached', AccountsReachedSchema)