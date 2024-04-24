import jwtService from '../services/jwt'

import { ERRORS } from '../config'

import logger from '../utils/logs/logger'
import { User } from '../modules/user/models'

export default () => async (ctx, next) => {
	const { authorization } = ctx.headers

	if(authorization) {
		const { phone } = jwtService.verify(authorization)

		if (!phone) {
			logger.error(`Error. Phone not found`)
			ctx.status = 401
			return ctx.body = {
				sucess: false,
				message: ERRORS['Unauthorized']
			}
		}

		let user = null

		try {
			user = await User.findOne({ phone, active: true, deletedAt: { $eq: null } })
		} catch (ex) {
			logger.error(`Error. ${ex.status} ${ex.message}`)
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: ERRORS[ex.name]
			}
		}

		if (!user) {
			logger.error(`Error. User not found`)
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
