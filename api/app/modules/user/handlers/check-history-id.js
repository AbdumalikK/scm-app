import { UserHistory } from '../../user-history/models'

import logger from '../../../utils/logs/logger'


export default () => async (id, ctx, next) => {
    try{
        const history = await UserHistory.findById(id)
        
        if(!history){
            logger.error(`Error. User history with id=${id} not found`)
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `User history with id=${id} not found`
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

    ctx.state.historyId = id

    await next()
}