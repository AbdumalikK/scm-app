import mongoose from 'mongoose'
import bcrypt from 'bcrypt-nodejs'
import uniqueValidator from 'mongoose-unique-validator'

mongoose.plugin(uniqueValidator)

const UserSchema = new mongoose.Schema({
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
		unique: true,
		required: 'User name is required'
	},
	refferal: {
		type: String,
		trim: true,
		default: null
	},
	bio: {
		type: String,
		default: null
	},
	password: {
		type: String,
		validate: [ /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_-])[a-zA-Z\d!@#$%^&*(),.?":{}|<>_-]{8,}$/, `Password must contain the following "/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_-])[a-zA-Z\d!@#$%^&*(),.?":{}|<>_-]{8,}$/" and must be minimum 8 character"`],
		required: 'Password is required',
		trim: true
	},
	role: {
		type: String,
		enum: ['business', 'private'],
		lowercase: true,
		default: 'private'
	},
	phone: {
		type: String,
		default: null,
	},
	email: {
		type: String,
		default: null
	},
	avaUri: {
		type: String,
		default: null
	},
	private: {
		type: Boolean,
		default: false
	},
	business: {
		type: Boolean,
		default: false
	},
	gender: {
		type: String,
		default: null
	},
	area: {
		country: {
			_id: {
				type: mongoose.Schema.Types.ObjectId,
				default: null
			},
			name: {
				type: String,
				default: null
			} 
		},
		state: {
			_id: {
				type: mongoose.Schema.Types.ObjectId,
				default: null
			},
			name: {
				type: String,
				default: null
			} 
		},
		city: {
			_id: {
				type: mongoose.Schema.Types.ObjectId,
				default: null
			},
			name: {
				type: String,
				default: null
			} 
		}
	},
	interests: [{
		type: String,
		default: null
	}],
	isOnboardingCompleted: {
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

UserSchema.statics.createFields = [ 
	'firstName', 'lastName', 'username', 'refferal', 'bio',
	'password', 'role', 'phone', 'email', 'avaUri', 'private', 'business',
	'gender', 'area', 'interests', 'isOnboardingCompleted'
];

UserSchema.pre('save', function(next){
	if (this.isModified('password')) {
		const salt = bcrypt.genSaltSync(10)
	
		this.password = bcrypt.hashSync(this.password, salt)
	}
	
	next()
})

UserSchema.methods.comparePasswords = function(password){
	return bcrypt.compareSync(password, this.password)
}

export default mongoose.model('user', UserSchema)