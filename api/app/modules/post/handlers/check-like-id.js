import { Post } from '../models'

import logger from '../../../utils/logs/logger'


export default () => async (id, ctx, next) => {
    try{
        const post = await Post.findOne({
            active: true,
            deletedAt: { $eq: null },
            'comment.like': {
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
                message: `Like with id=${id} not found`
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

    ctx.state.likeId = id

    await next()
}