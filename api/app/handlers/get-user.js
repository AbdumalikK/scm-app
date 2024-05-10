import jwtService from '../services/jwt'

import { ERRORS } from '../config'

import { User } from '../modules/user/models'

export default async (ctx) => {
	const { authorization } = ctx.headers

	let user = null

	if(authorization) {
		const { phone, email, username } = jwtService.verify(authorization)

		if (!phone && !email && !username) {
			ctx.status = 401
			return ctx.body = {
				sucess: false,
				message: ERRORS['Unauthorized'],
				data: null
			}
		}

		const cred = phone || email || username

		try {
			user = await User.findOne({ $or: [{ phone: cred }, { email: cred }, { username: cred }], active: true, deletedAt: { $eq: null } })
		} catch (ex) {
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: ERRORS[ex.name],
				data: null
			}
		}

		if (!user) {
			ctx.status = 401
			return ctx.body = {
				success: false,
				message: ERRORS['Unauthorized'],
				data: null
			}
		}
	}

	return user
}
