import { Currency } from '../models'

import logger from '../../../utils/logs/logger'

export default () => async (id, ctx, next) => {
    try{
        const currency = await Currency.findById(id)
        
        if(!currency){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `Currency with id=${id} not found`,
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