import { Post } from '../../post/models'
import logger from '../../../utils/logs/logger'


export default () => async (id, ctx, next) => {
    try{
        const post = await Post.findOne({ _id: id, active: true, deletedAt: { $eq: null } })

        if(!post){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `Post with id=${id} not found`,
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

    ctx.state.postId = id

    await next()
};