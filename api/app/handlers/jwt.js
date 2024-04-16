import jwtService from '../services/jwt'

import { ERRORS } from '../config'

import logger from '../utils/logs/logger'
import { UserService } from '../modules/user'

export default () => async (ctx, next) => {
	const { authorization } = ctx.headers

	if(authorization) {
		const { phone } = await jwtService.verify(authorization)

		if (!phone) {
			ctx.status = 401
			return ctx.body = {
				status: 'error',
				message: ERRORS['Unauthorized']
			}
		}

		let user = null

		try {
			user = await UserService.findOne(phone)
		} catch (ex) {
			ctx.status = 500
			return ctx.body = {
				status: 'error',
				message: ERRORS[ex.name]
			}
		}

		if (!user) {
			ctx.status = 401
			return ctx.body = {
				status: 'error',
				message: ERRORS['Unauthorized']
			}
		}

		ctx.state.user = user	
	}

	await next()
}
