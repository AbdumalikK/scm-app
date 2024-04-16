export default () => async (ctx, next) => {
	const { authorization } = ctx.headers;

	if(authorization){
		ctx.throw(404, `Page not found`);
	}

	await next();
}