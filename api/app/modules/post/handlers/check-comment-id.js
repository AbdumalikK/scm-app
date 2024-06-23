import { Post } from '../models'

import logger from '../../../utils/logs/logger'


export default () => async (id, ctx, next) => {
    try{
        const post = await Post.findOne({
            active: true, 
            deletedAt: { $eq: null }, 
            comment: { 
                $elemMatch: {
                    _id: id,
                    active: true,
                    deletedAt: { $eq: null }
                } 
            }
        })

        if(!post){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `Comment with id=${id} not found`,
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

    ctx.state.commentId = id

    await next()
}