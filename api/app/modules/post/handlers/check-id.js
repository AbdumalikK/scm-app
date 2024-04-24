import { UserPost } from '../../post/models'
import logger from '../../../utils/logs/logger'


export default () => async (id, ctx, next) => {
    try{
        const post = await UserPost.findOne({ _id: id, active: true, deletedAt: { $eq: null } })

        if(!post){
            logger.error(`Error. Post with id=${id} not found`)
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `Post with id=${id} not found`
            }
        }
    }catch(ex){
        logger.error(`Error. ${ex.status} ${ex.message}`)
        ctx.status = 500
        return ctx.body = {
            success: false,
            message: ex.message
        }
    }

    ctx.state.postId = id

    await next()
};