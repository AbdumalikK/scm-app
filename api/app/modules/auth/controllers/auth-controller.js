import pick from 'lodash/pick'
import randomatic from 'randomatic'

import { ERRORS, JWT_SECRET } from '../../../config'
import { client } from '../../../server'
import { SIGNUP_PAYLOAD, FORGOT_PASSWORD_PAYLOAD } from '../constants'
import { SIGNUP_TYPE_PHONE, SIGNUP_TYPE_EMAIL } from '../constants/types'
import { User } from '../../user/models'
import { Privacy } from '../../privacy/models'
import { SMSService } from '../../../services/sms'
import issueTokenPair from '../../../helpers/issueTokenPair'
import jwtService from '../../../services/jwt'
import { MailService } from '../../../services/mail'
import { OtpTraffic } from '../../otp'


export default {
	async signup(ctx){
		const {
			request: {
				body: {
					type = null,
					phone = null,
					email = null,

					username = null
				}
			}
		} = ctx

		if(!type){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Type is null`
			};
		}

		let auth = {}, user = null, to = null

		switch(type){
			case SIGNUP_TYPE_PHONE: {
				const validation = /^\+[0-9]{12}$/
				const passed = validation.test(phone)
			
				if(!passed){
					ctx.status = 400
					return ctx.body = {
						success: false,
						message: `Phone validation error`
					};
				}

				try{
					user = await User.findOne({ phone })
		
					if(user){
						ctx.status = 400
						return ctx.body = {
							success: false,
							message: `User with phone=${userData.phone} already exists`
						};
					}
		
					user = await User.create({ phone, password, username, refferal })
				}catch(ex){
					ctx.status = 500
					return ctx.body = {
						success: false,
						message: `Internal error. ${ex.status} ${ex.message}`
					};
				}

				to = phone
				auth['type'] = phone
				break
			}

			case SIGNUP_TYPE_EMAIL: {
				const validation = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
				const passed = validation.test(email)
			
				if(!passed){
					ctx.status = 400
					return ctx.body = {
						success: false,
						message: `Email validation error`
					};
				}

				try{
					user = await User.findOne({ email: userData.email })
		
					if(user){
						ctx.status = 400
						return ctx.body = {
							success: false,
							message: `User with email=${userData.email} already exists`
						};
					}
		
					user = await User.create({ email, password, username, refferal })
				}catch(ex){
					ctx.status = 500
					return ctx.body = {
						success: false,
						message: `Internal error. ${ex.status} ${ex.message}`
					};
				}

				to = email
				auth['type'] = phone
				break
			}

			default: {
				ctx.status = 400
				return ctx.body = {
					success: false,
					message: `Invalid value of param type`
				};
			}
		}

		// check last otp date, date > 2 min then ok else error 
		try{
			await Privacy.create({ creatorId: user._id })

			const lastOtpTraffic = await OtpTraffic.findOne({ to }).sort({ createdAt: -1 })

			let date = new Date()
            date.setMinutes(date.getMinutes() - 2)

			if(lastOtpTraffic && (lastOtpTraffic.createdAt > date)){
                const ms = Math.abs(lastOtpTraffic.createdAt - date)

				const min = ~~(ms / 60000)
				const sec = ((ms % 60000) / 1000).toFixed(0)

                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Try again after ${min}:${(sec < 10 ? '0' : '') + sec}`
                    
                }
			}
		}catch(ex){
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `Internal error. ${ex.status} ${ex.message}`
			};
		}
		
		const otp = randomatic('0', 4)

		try{
			await client.set(otp, JSON.stringify(auth), 'EX', 60 * 5)
		}catch(ex){
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `Internal error. ${ex.status} ${ex.message}`
			};
		}

		let newOtp = null

		try{
			newOtp = await OtpTraffic.create({ type, otp, to })

			setTimeout(async () => {
				await OtpTraffic.findByIdAndUpdate(newOtp._id, { $set: { deletedAt: new Date() } })
			}, 1000 * 60 * 2)
		}catch(ex){
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `Internal error. ${ex.status} ${ex.message}`
			};
		}

		if(type === SIGNUP_TYPE_PHONE){
			return SMSService(phone, SIGNUP_PAYLOAD(otp))	
			.then(() => {
				ctx.status = 201
				return ctx.body = {
					success: true,
					message: `Sms sent successfully`
				}
			})
			.catch(async error => {
				ctx.status = 500
				return ctx.body = {
					success: false,
					message: `Failed to send sms. ${error.message}`
				}
			})
		}else{
			try {
				const info = await MailService(email, otp, username);
				
				newOtp.messageId = info.messageId
				newOtp.save()

				ctx.status = 201
				return ctx.body = {
					success: true,
					message: `Email sent successfully`
				}
			} catch (error) {
				ctx.status = 500
				return ctx.body = {
					success: false,
					message: `Failed to send email. ${error}`
				}
			}
		}
	},

	async signupConfirm(ctx){
		const {
			request: {
				body: {
					otp = null
				}
			}
		} = ctx

		if(!otp){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: ERRORS['BadRequest']
			}
		}

		let otpExist = null

		try{
			otpExist = JSON.parse(await client.get(otp))

			await client.del(otp)
		}catch(ex){
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `Internal error. ${ex.status} ${ex.message}`
			};
		}

		if(!otpExist){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Otp not found`
			}
		}

		let user = null

		const select = { 
			__v: 0,
			password: 0,
			deletedAt: 0,
			updatedAt: 0,
			createdAt: 0
		 }

		try {
			user = await User.findOne({ $or: [{ phone: otpExist.type }, { email: otpExist.type }], active: true, deletedAt: { $eq: null } }).select(select)
		}catch(ex){
			ctx.status = 404
			return ctx.body = {
				success: false,
				message: `User not found`
			}
		}

		try {
			const { token, refreshToken } = await issueTokenPair(otpExist.type, user)

			ctx.body = {
				success: true,
				message: {
					user,
					token,
					refreshToken
				}
			}
		}catch(ex){
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `Internal error`
			}
		}
	},

	async signin(ctx){
		const {
			request: {
				body: {
					username = null,
					password = null
				}
			}
		} = ctx

		if(!username){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Username not passed`
			}
		}

		if(!password){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Password not passed`
			}
		}

		let user = null

		const select = { 
			__v: 0,
			deletedAt: 0,
			updatedAt: 0,
			createdAt: 0,
			active: 0,
			password: 0
		 }

		try {
			user = await User.findOne({ $or: [{ phone: username }, { email: username }, { username }], active: true, deletedAt: { $eq: null } })
		}catch(ex){
			ctx.status = 404
			return ctx.body = {
				success: false,
				message: `User not found`
			}
		}

		if(!(user).comparePasswords(password)){
			ctx.status = 403
			return ctx.body = {
				success: false, 
				message: 'Invalid password' 
			}
		}

		try {
			user = await User.findById(user._id).select(select)
			
			const { token, refreshToken } = await issueTokenPair(user.username, user)

			ctx.body = {
				success: true,
				message: {
					user,
					token,
					refreshToken
				}
			}
		}catch(ex){
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `Internal error`
			}
		}
	},

	async forgotPassword(ctx){
		const {
			request: {
				body: {
					type = null,
					phone = null,
					email = null
				}
			}
		} = ctx

		if(!type){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Type is null`
			};
		}

		let user = null, payload = {}

		switch(type){
			case SIGNUP_TYPE_PHONE: {
				const validation = /^\+[0-9]{12}$/
				const passed = validation.test(phone)
			
				if(!passed){
					ctx.status = 400
					return ctx.body = {
						success: false,
						message: `Phone validation error`
					};
				}

				try {
					user = await User.findOne({ phone, active: true, deletedAt: { $eq: null } }).select({ __v: 0 })
				}catch(ex){
					ctx.status = 404
					return ctx.body = {
						success: false,
						message: `User not found`
					}
				}

				if(!user){
					ctx.status = 400
					return ctx.body = {
						success: false,
						message: `User with phone=${phone} not found`
					};
				}

				payload['phone'] = user.phone

				break
			}
			case SIGNUP_TYPE_EMAIL: {
				const validation = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
				const passed = validation.test(email)
			
				if(!passed){
					ctx.status = 400
					return ctx.body = {
						success: false,
						message: `Email validation error`
					};
				}
		
				try {
					user = await User.findOne({ email, active: true, deletedAt: { $eq: null } }).select({ __v: 0 })
				}catch(ex){
					ctx.status = 404
					return ctx.body = {
						success: false,
						message: `User not found`
					}
				}


				if(!user){
					ctx.status = 400
					return ctx.body = {
						success: false,
						message: `User with email=${email} not found`
					};
				}

				payload['email'] = user.email

				break
			}
			default: {
				ctx.status = 400
				return ctx.body = {
					success: false,
					message: `Invalid value of param type`
				};
			}
		}

		payload['_id'] = user._id
		payload['password'] = user.password

		const otp = randomatic('0', 4)

		try{
			await client.set(otp, JSON.stringify(payload), 'EX', 60 * 5)
		}catch(ex){
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `Internal error. ${ex.status} ${ex.message}`
			};
		}

		// const token = jwtService.genTokenPassword(payload, JWT_SECRET + user.password)		

		if(type === SIGNUP_TYPE_PHONE){
			return SMSService(phone, FORGOT_PASSWORD_PAYLOAD(otp))
			.then(data => {
				ctx.status = 201
				return ctx.body = {
					success: true,
					message: `Sms sent successfully`
				}
			})
			.catch(async error => {
				ctx.status = 500
				return ctx.body = {
					success: false,
					message: `Failed to send sms. ${error}`
				}
			})
		}else{
			try {
				const info = await MailService(user.email, otp, user.username);
				console.log('Message sent: %s', info.messageId);
				
				ctx.status = 201
				return ctx.body = {
					success: true,
					message: `Email sent successfully`
				}
			} catch (error) {
				ctx.status = 500
				return ctx.body = {
					success: false,
					message: `Failed to send email. ${error}`
				}
			}
		}
	},

	async resetPassword(ctx){
		const {
			request: {
				body: {
					type = null,
					otp = null,
					password
				}
			}
		} = ctx

		if(!type){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Type is null`
			};
		}

		if(!otp){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Type is null`
			};
		}

		let otpExist = null

		try{
			otpExist = JSON.parse(await client.get(otp))

			await client.del(otp)
		}catch(ex){
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `Internal error. ${ex.status} ${ex.message}`
			};
		}

		if(!otpExist){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Otp not found`
			}
		}

		let user = null

		try {
			user = await User.findById(otpExist._id).select({ password: 1 })
		}catch(ex){
			ctx.status = 404
			return ctx.body = {
				success: false,
				message: `User not found`
			}
		}

		if(!user){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `User with ${type == SIGNUP_TYPE_PHONE ? `phone=${otpExist.phone}` : `email=${otpExist.email}`} not found`
			};
		}


		if(otpExist._id != user._id){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `User with _id=${_id} does not belong to user with _id=${user._id}`
			};
		}
		
		user.password = password
		await user.save()

		ctx.body = {
			success: true,
			message: `Password successfully changed`
		}

	}
};

