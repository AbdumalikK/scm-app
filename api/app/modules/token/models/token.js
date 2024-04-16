import mongoose from 'mongoose';

const TokenSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true
    },
    token: {
        type: String,
        unique: 'Refresh Token must be unique',
        required: true
    }
});

export default mongoose.model('token', TokenSchema);