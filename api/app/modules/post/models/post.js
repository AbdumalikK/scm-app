import mongoose from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'

mongoose.plugin(uniqueValidator)

const UserPostSchema = new mongoose.Schema({
	firstName: {
		type: String,
		trim: true,
		default: null
	},
	lastName: {
		type: String,
		trim: true,
		default: null
	},
	username: {
		type: String,
		trim: true,
		required: 'User name is required'
	},
	avaUri: {
		type: String,
		default: null
	  },
	mediaUri: [{
		type: String,
		required: true
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
		status: {
			type: Number, // 1 - created, 2 - removed
			default: null
		}
	}],
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
		},
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
		}]
    }],
	gifts: [{
        creatorId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        payload: {
            type: String,
            default: ''
        }
	}],
	creatorId: {
		type: mongoose.Schema.Types.ObjectId,
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
}, { timestamps: true });

UserPostSchema.statics.createFields = [ 
	'firstName', 'lastName', 'username', 'avaUri', 
];

export default mongoose.model('post', UserPostSchema);
