import mongoose from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'

mongoose.plugin(uniqueValidator)

const PostSchema = new mongoose.Schema({
	creatorId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	mediaUri: [{
		type: String,
		required: true
	}],
	isTv: {
		type: Boolean,
		default: false
	},
	price: {
		type: Number,
		default: 0
	},
	audience: [{
		type: mongoose.Schema.Types.ObjectId,
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
		}],
		reply: [{
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
	tags: [{
		type: String,
		default: null
	}],
	paid: {
		type: Boolean,
		default: false
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

PostSchema.statics.createFields = [ 
	'mediaUri', 'tags', 'isTv', 'price', 'audience', 'like',
	'comment', 'gifts', 'tags', 'paid'
]

export default mongoose.model('post', PostSchema)
