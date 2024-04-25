import { Following } from '../models'

import logger from '../../../utils/logs/logger'


export default () => async (id, ctx, next) => {
    try{
        const following = await Following.findById(id)
        
        if(!following){
            logger.error(`Error. Following with id=${id} not found`)
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `Following with id=${id} not found`
            }
        }
    }catch(ex){
        logger.error(`Error. ${ex.status} ${ex.message}`)
        ctx.status = 400
        return ctx.body = {
            success: false,
            message: `Internal error`
        }
    }

    ctx.state.followingId = id

    await next()
}