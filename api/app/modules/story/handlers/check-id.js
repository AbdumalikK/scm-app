import { Story } from '../models'

import logger from '../../../utils/logs/logger'

export default () => async (id, ctx, next) => {
    try{
        const story = await Story.findOne({ _id: id, active: true, deletedAt: { $eq: null } })
        
        if(!story){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `Story with id=${id} not found`
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