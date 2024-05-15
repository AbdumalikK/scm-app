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
					password = null,
					username = null,
					refferal = null
				}
			}
		} = ctx

		if(!type){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Type is null`,
				data: null
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
						message: `Phone validation error`,
						data: null
					};
				}

				try{
					user = await User.findOne({ phone })
		
					if(user){
						ctx.status = 400
						return ctx.body = {
							success: false,
							message: `User with phone=${phone} already exists`,
							data: null
						};
					}
		
					user = await User.create({ phone, password, username, refferal })
				}catch(ex){
					ctx.status = 500
					return ctx.body = {
						success: false,
						message: `Internal error. ${ex.status} ${ex.message}`,
						data: null
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
						message: `Email validation error`,
						data: null
					};
				}

				try{
					user = await User.findOne({ email })
		
					if(user){
						ctx.status = 400
						return ctx.body = {
							success: false,
							message: `User with email=${email} already exists`,
							data: null
						}
					}
		
					user = await User.create({ email, password, username, refferal })
				}catch(ex){
					ctx.status = 500
					return ctx.body = {
						success: false,
						message: `Internal error. ${ex.status} ${ex.message}`,
						data: null
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
					message: `Invalid value of param type`,
					data: null
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
                    message: `Try again after ${min}:${(sec < 10 ? '0' : '') + sec}`,
					data: null
                    
                }
			}
		}catch(ex){
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `Internal error. ${ex.status} ${ex.message}`,
				data: null
			};
		}
		
		const otp = randomatic('0', 4)

		try{
			await client.set(otp, JSON.stringify(auth), 'EX', 60 * 5)
		}catch(ex){
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `Internal error. ${ex.status} ${ex.message}`,
				data: null
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
				message: `Internal error. ${ex.status} ${ex.message}`,
				data: null
			};
		}

		if(type === SIGNUP_TYPE_PHONE){
			return SMSService(phone, SIGNUP_PAYLOAD(otp))	
			.then(() => {
				ctx.status = 201
				return ctx.body = {
					success: true,
					message: `Sms sent successfully`,
					data: null
				}
			})
			.catch(async error => {
				ctx.status = 500
				return ctx.body = {
					success: false,
					message: `Failed to send sms. ${error.message}`,
					data: null
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
					message: `Email sent successfully`,
					data: {
						user,
						messageId: info.messageId
					}
				}
			} catch (error) {
				ctx.status = 500
				return ctx.body = {
					success: false,
					message: `Failed to send email. ${error}`,
					data: null
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
				message: ERRORS['BadRequest'],
				data: null
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
				message: `Internal error. ${ex.status} ${ex.message}`,
				data: null
			};
		}

		if(!otpExist){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Otp not found`,
				data: null
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
				message: `User not found`,
				data: null
			}
		}

		try {
			const { token, refreshToken } = await issueTokenPair(otpExist.type, user)

			ctx.body = {
				success: true,
				message: `User successfully signed in`,
				data: {
					user,
					token,
					refreshToken,
				}
			}
		}catch(ex){
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `Internal error`,
				data: null
			}
		}
	},

	async signin(ctx){
		const {
			request: {
				body: {
					type = null,
					username = null,
					password = null,
					phone = null
				}
			}
		} = ctx

		if(!type){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Type not passed`,
				data: null
			}
		}

		switch(type){
			case SIGNUP_TYPE_PHONE: {
				const validation = /^\+[0-9]{12}$/
				const passed = validation.test(phone)
			
				if(!passed){
					ctx.status = 400
					return ctx.body = {
						success: false,
						message: `Phone validation error`,
						data: null
					};
				}

				let user = null

				try{
					user = await User.findOne({ phone })
				}catch(ex){
					ctx.status = 500
					return ctx.body = {
						success: false,
						message: `Internal error. ${ex.status} ${ex.message}`,
						data: null
					};
				}

				if(!user){
					ctx.status = 400
					return ctx.body = {
						success: false,
						message: `User with phone=${phone} does not exist`,
						data: null
					};
				}

				const otp = randomatic('0', 4)

				try{
					await client.set(otp, JSON.stringify(phone), 'EX', 60 * 5)
				}catch(ex){
					ctx.status = 500
					return ctx.body = {
						success: false,
						message: `Internal error. ${ex.status} ${ex.message}`,
						data: null
					};
				}

				let newOtp = null

				try{
					newOtp = await OtpTraffic.create({ type, otp, to: phone })

					setTimeout(async () => {
						await OtpTraffic.findByIdAndUpdate(newOtp._id, { $set: { deletedAt: new Date() } })
					}, 1000 * 60 * 2)
				}catch(ex){
					ctx.status = 500
					return ctx.body = {
						success: false,
						message: `Internal error. ${ex.status} ${ex.message}`,
						data: null
					};
				}

				return SMSService(phone, SIGNUP_PAYLOAD(otp))	
					.then(() => {
						ctx.status = 201
						ctx.set('x-remove-otp', otp) // need to be removed: -> dev purpose 	q
						return ctx.body = {
							success: true,
							message: `Sms sent successfully`,
							data: null
						}
					})
					.catch(async error => {
						ctx.status = 500
						return ctx.body = {
							success: false,
							message: `Failed to send sms. ${error.message}`,
							data: null
						}
					})
			}

			case SIGNUP_TYPE_EMAIL: {
				if(!username){
					ctx.status = 400
					return ctx.body = {
						success: false,
						message: `Username not passed`,
						data: null
					}
				}
		
				if(!password){
					ctx.status = 400
					return ctx.body = {
						success: false,
						message: `Password not passed`,
						data: null
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
					user = await User.findOne({ $or: [{ email: username }, { username }], active: true, deletedAt: { $eq: null } })
				}catch(ex){
					ctx.status = 404
					return ctx.body = {
						success: false,
						message: `User not found`,
						data: null
					}
				}
		
				if(!(user).comparePasswords(password)){
					ctx.status = 403
					return ctx.body = {
						success: false, 
						message: 'Invalid password',
						data: null
					}
				}
		
				try {
					user = await User.findById(user._id).select(select)
					
					const { token, refreshToken } = await issueTokenPair(user.username, user)
		
					ctx.body = {
						success: true,
						message: `User successfully signed in`,
						data: {
							user,
							token,
							refreshToken
						}
					}
				}catch(ex){
					ctx.status = 500
					return ctx.body = {
						success: false,
						message: `Internal error`,
						data: null
					}
				}
				break
			}

			default: {
				ctx.status = 400
				return ctx.body = {
					success: false,
					message: `Invalid value of param type`,
					data: null
				};
			}
		}
	},

	async signinConfirm(ctx){
		const {
			request: {
				body: {
					otp = null,
				}
			}
		} = ctx

		if(!otp){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Otp not passed`,
				data: null
			};
		}

		let phone = null

		try{
			phone = JSON.parse(await client.get(otp))

			await client.del(otp)
		}catch(ex){
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `Internal error. ${ex.status} ${ex.message}`,
				data: null
			};
		}

		if(!phone){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Otp not found`,
				data: null
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
			user = await User.findOne({ phone }).select(select)
		}catch(ex){
			ctx.status = 404
			return ctx.body = {
				success: false,
				message: `User not found`,
				data: null
			}
		}

		if(!user){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `User with phone=${phone} not found`,
				data: null
			};
		}
		
		try {
			const { token, refreshToken } = await issueTokenPair(user.username, user)

			ctx.body = {
				success: true,
				message: `User successfully signed in`,
				data: {
					user,
					token,
					refreshToken
				}
			}
		}catch(ex){
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `Internal error`,
				data: null
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
				message: `Type not passed`,
				data: null
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
						message: `Phone validation error`,
						data: null
					};
				}

				try {
					user = await User.findOne({ phone, active: true, deletedAt: { $eq: null } }).select({ __v: 0 })
				}catch(ex){
					ctx.status = 404
					return ctx.body = {
						success: false,
						message: `User not found`,
						data: null
					}
				}

				if(!user){
					ctx.status = 400
					return ctx.body = {
						success: false,
						message: `User with phone=${phone} not found`,
						data: null
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
						message: `Email validation error`,
						data: null
					};
				}
		
				try {
					user = await User.findOne({ email, active: true, deletedAt: { $eq: null } }).select({ __v: 0 })
				}catch(ex){
					ctx.status = 404
					return ctx.body = {
						success: false,
						message: `User not found`,
						data: null
					}
				}


				if(!user){
					ctx.status = 400
					return ctx.body = {
						success: false,
						message: `User with email=${email} not found`,
						data: null
					};
				}

				payload['email'] = user.email

				break
			}
			default: {
				ctx.status = 400
				return ctx.body = {
					success: false,
					message: `Invalid value of param type`,
					data: null
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
				message: `Internal error. ${ex.status} ${ex.message}`,
				data: null
			};
		}

		// const token = jwtService.genTokenPassword(payload, JWT_SECRET + user.password)		

		if(type === SIGNUP_TYPE_PHONE){
			return SMSService(phone, FORGOT_PASSWORD_PAYLOAD(otp))
			.then(data => {
				ctx.status = 201
				return ctx.body = {
					success: true,
					message: `Sms sent successfully`,
					data: null
				}
			})
			.catch(async error => {
				ctx.status = 500
				return ctx.body = {
					success: false,
					message: `Failed to send sms. ${error}`,
					data: null
				}
			})
		}else{
			try {
				const info = await MailService(user.email, otp, user.username);
				console.log('Message sent: %s', info.messageId);
				
				ctx.status = 201
				return ctx.body = {
					success: true,
					message: `Email sent successfully`,
					data: {
						messageId: info.messageId
					}
				}
			} catch (error) {
				ctx.status = 500
				return ctx.body = {
					success: false,
					message: `Failed to send email. ${error}`,
					data: null
				}
			}
		}
	},

	async forgotPasswordConfirm(ctx){
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
				message: `Otp not passed`,
				data: null
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
				message: `Internal error. ${ex.status} ${ex.message}`,
				data: null
			};
		}

		if(!otpExist){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Otp not found`,
				data: null
			}
		}

		let user = null

		try {
			user = await User.findById(otpExist._id).select({ password: 1 })
		}catch(ex){
			ctx.status = 404
			return ctx.body = {
				success: false,
				message: `User not found`,
				data: null
			}
		}

		if(!user){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `User with _id=${otpExist._id} not found`,
				data: null
			};
		}

		const payload = {
			_id: user._id,
			password: user.password,
			otp,
		}

		try{
			await client.set(JSON.stringify(user._id), JSON.stringify(payload), 'EX', 60 * 5)
		}catch(ex){
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `Internal error. ${ex.status} ${ex.message}`,
				data: null
			};
		}

		ctx.body = {
			success: true,
			message: `Otp confirmed`,
			data: {
				_id: user._id
			}
		}
	},

	async resetPassword(ctx){
		const {
			request: {
				body: {
					_id = null,
					password = null
				}
			}
		} = ctx

		if(!_id){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Id not passed`,
				data: null
			};
		}

		if(!password){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Password not passed`,
				data: null
			};
		}

		let userExist = null

		try{
			userExist = JSON.parse(await client.get(JSON.stringify(_id)))

			await client.del(JSON.stringify(_id))
		}catch(ex){
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `Internal error. ${ex.status} ${ex.message}`,
				data: null
			};
		}

		if(!userExist){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Id not found`,
				data: null
			}
		}

		let user = null

		try {
			user = await User.findById(userExist._id).select({ password: 1 })
		}catch(ex){
			ctx.status = 404
			return ctx.body = {
				success: false,
				message: `User not found`,
				data: null
			}
		}

		if(!user){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `User with id=${_id} not found`,
				data: null
			};
		}
		
		try {		
			user.password = password
			await user.save()
		}catch(ex){
			ctx.status = 404
			return ctx.body = {
				success: false,
				message: ex.message,
				data: null
			}
		}

		ctx.body = {
			success: true,
			message: `Password successfully changed`,
			data: null
		}

	}
};

