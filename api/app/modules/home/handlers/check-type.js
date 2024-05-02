import logger from '../../../utils/logs/logger'
import { FOLLOWERS, FOLLOWING } from '../constants'


export default () => async (type, ctx, next) => {
    if(type !== FOLLOWERS || type !== FOLLOWING){
        ctx.status = 400
        return ctx.body = {
            success: false,
            message: `Invalid value of param type. Got: ${type}. Expected: ${FOLLOWING} or ${FOLLOWERS}`
        }
    }

    ctx.state.type = type

    await next()
}