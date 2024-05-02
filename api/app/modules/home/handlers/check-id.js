import { User } from '../../user/models'
import logger from '../../../utils/logs/logger'


export default () => async (id, ctx, next) => {
    try{
        const user = await User.findById(id)

        if(!user){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `User with id=${id} not found`
            }
        }
    }catch(ex){
        ctx.status = 500
        return ctx.body = {
            success: false,
            message: ex.message
        }
    }

    ctx.state.id = id

    await next()
};