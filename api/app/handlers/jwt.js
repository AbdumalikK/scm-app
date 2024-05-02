import jwtService from '../services/jwt'

import { ERRORS } from '../config'

import { User } from '../modules/user/models'

export default () => async (ctx, next) => {
	const { authorization } = ctx.headers

	if(authorization) {
		const { phone, email, username } = jwtService.verify(authorization)

		if (!phone && !email && !username) {
			ctx.status = 401
			return ctx.body = {
				sucess: false,
				message: ERRORS['Unauthorized']
			}
		}

		const cred = phone || email || username

		let user = null

		try {
			user = await User.findOne({ $or: [{ phone: cred }, { email: cred }, { username: cred }], active: true, deletedAt: { $eq: null } })
		} catch (ex) {
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: ERRORS[ex.name]
			}
		}

		if (!user) {
			ctx.status = 401
			return ctx.body = {
				success: false,
				message: ERRORS['Unauthorized']
			}
		}

		ctx.state.user = user	
	}

	await next()
}
