import { Chat } from '../models'

import logger from '../../../utils/logs/logger'


export default () => async (id, ctx, next) => {
    try{
        const chat = await Chat.findOne({ _id: id, active: true, deletedAt: { $eq: null } })
        
        if(!chat){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `Chat with id=${id} not found`,
                data: null
            }
        }
    }catch(ex){
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