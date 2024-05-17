import { Message } from '../models'

import logger from '../../../utils/logs/logger'


export default () => async (id, ctx, next) => {
    try{
        const message = await Message.findOne({ _id: id, active: true, deletedAt: { $eq: null } })
        
        if(!message){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `Message with id=${id} not found`,
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