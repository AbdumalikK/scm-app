import { Area } from '../models'

import logger from '../../../utils/logs/logger'

export default () => async (id, ctx, next) => {
    try{
        const area = await Area.findOne({ _id: id, active: true, deletedAt: { $eq: null } })
        
        if(!area){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `Area with id=${id} not found`,
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

    ctx.state.id = id

    await next()
}