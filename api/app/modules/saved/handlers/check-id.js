import { Saved } from '../models'

import logger from '../../../utils/logs/logger'

export default () => async (id, ctx, next) => {
    try{
        const saved = await Saved.findOne({ _id: id, active: true, deletedAt: { $eq: null } })
        
        if(!saved){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `Saved with id=${id} not found`
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