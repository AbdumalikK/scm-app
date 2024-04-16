import { ERRORS } from '../../../config';

export default () => async (ctx, next) => {
	if(ctx.state.user){
		ctx.status = 404
		return ctx.body = {
			success: false,
			message: ERRORS['NotFound']
		}
	}
	await next();
};