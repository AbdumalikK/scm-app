import { User } from '../models'

import logger from '../../../utils/logs/logger'


export default () => async (id, ctx, next) => {
    try{
        const user = await User.findById(id)
        
        if(!user){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `Creator with id=${id} not found`,
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

    ctx.state.creatorId = id

    await next()
}