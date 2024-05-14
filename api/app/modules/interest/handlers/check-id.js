import { Interest } from '../models'

import logger from '../../../utils/logs/logger'

export default () => async (id, ctx, next) => {
    try{
        const interest = await Interest.findOne({ _id: id, active: true, deletedAt: { $eq: null } })
        
        if(!interest){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `Interest with id=${id} not found`
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

    ctx.state.id = id

    await next()
}