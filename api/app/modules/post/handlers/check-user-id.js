import { User } from '../../user/models'
import logger from '../../../utils/logs/logger'


export default () => async (id, ctx, next) => {
    try{
        const user = await User.findOne({ _id: id, active: true, deletedAt: { $eq: null } })

        if(!user){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `User with id=${id} not found`,
                data: null
            }
        }
    }catch(ex){
        logger.error(`Error. ${ex.status} ${ex.message}`)
        ctx.status = 500
        return ctx.body = {
            success: false,
            message: ex.message,
            data: null
        }
    }

    ctx.state.userId = id

    await next()
};