import { Following } from '../models'

import logger from '../../../utils/logs/logger'


export default () => async (id, ctx, next) => {
    try{
        const following = await Following.findById(id)
        
        if(!following){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `Following with id=${id} not found`
            }
        }
    }catch(ex){
        ctx.status = 400
        return ctx.body = {
            success: false,
            message: `Internal error`
        }
    }

    ctx.state.followingId = id

    await next()
}