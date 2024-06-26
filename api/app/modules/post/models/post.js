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
	title: {
		type: String,
		default: null
	},
	description: {
		type: String,
		default: null
	},
	reels: {
		type: Boolean,
		default: false
	},
	tv: {
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
		active: {
			type: Boolean,
			default: true
		},
		deletedAt: {
			type: Date,
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
	'mediaUri', 'title', 'description', 'tv', 'price', 'audience', 
	'like', 'comment', 'gifts', 'tags'
]

export default mongoose.model('post', PostSchema)
