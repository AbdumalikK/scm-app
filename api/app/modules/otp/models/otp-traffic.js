import mongoose from 'mongoose'

const OtpTrafficSchema = new mongoose.Schema({
	type: {
		type: Number, // 1 - phone, 2 - email
		default: null
	},
	otp: {
		type: String,
		required: 'Code is required'
	},
	to: {
		type: String,
		required: 'To is required',
		trim: true,
	},
	messageId: {
		type: String,
		default : null
	},
	deletedAt: {
		type: Date,
		default: null
	}
}, { timestamps: true });

OtpTrafficSchema.statics.createFields = [ 'otp', 'to' ];

export default mongoose.model('otp_traffic', OtpTrafficSchema);
