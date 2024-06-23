import mongoose from 'mongoose';

const PhonebookSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  phone: {
    type: String,
		validate: [ /^\d{8,}$/, `Phone number must contain the following "/^\d{8,}$/"` ],
    required: true
  }
}, { timestamps: true })

PhonebookSchema.statics.createFields = [ 'phone' ]

export default mongoose.model('phonebook', PhonebookSchema)