import { Story } from '../models'

import logger from '../../../utils/logs/logger'


export default () => async (id, ctx, next) => {
    try{
        const story = await Story.findOne({
            active: true,
            deletedAt: { $eq: null },
            like: {
                $elemMatch: {
                    _id: id,
                    active: true,
                    deletedAt: { $eq: null }
                }
            } 
        })
        
        if(!story){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `Story with id=${id} not found`,
                data: null
            }
        }
    }catch(ex){
        logger.error(`Error. ${ex.status} ${ex.message}`)
        ctx.status = 400
        return ctx.body = {
            success: false,
            message: `Internal error`,
            data: null
        }
    }

    ctx.state.likeId = id

    await next()
}