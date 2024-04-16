import { ERRORS } from '../config'

import logger from '../utils/logs/logger'

export default () => async (ctx, next) => {
	if(!ctx.state.user){
		ctx.status = 403
		return ctx.body = {
			status: 'error',
			message: ERRORS['Forbidden']
		}
	}

	await next();
};