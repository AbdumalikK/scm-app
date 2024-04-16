import { User } from '../models'

import logger from '../../../utils/logs/logger'


export default () => async (id, ctx, next) => {
    try{
        const user = await User.findById(id)
        
        if(!user){
            logger.error(`Error. Creator with id=${id} not found`)
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `Creator with id=${id} not found`
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

    ctx.state.creatorId = id

    await next()
}