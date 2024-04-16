import { UserBlock } from '../../user-block/models'

import logger from '../../../utils/logs/logger'


export default () => async (id, ctx, next) => {
    try{
        const userBlock = await UserBlock.findById(id)
        
        if(!userBlock){
            logger.error(`Error. User block with id=${id} not found`)
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `User block with id=${id} not found`
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

    ctx.state.userBlockId = id

    await next()
}