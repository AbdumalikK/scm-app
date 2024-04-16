import { User } from '../models'

import logger from '../../../utils/logs/logger'


export default () => async (id, ctx, next) => {
    try{
        const user = await User.findById(id)
        
        if(!user){
            logger.error(`Error. User with id=${id} not found`)
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `User with id=${id} not found`
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

    ctx.state.userId = id

    await next()
}