import { UserPost } from '../models'

import logger from '../../../utils/logs/logger'


export default () => async (id, ctx, next) => {
    try{
        const post = await UserPost.findOne({
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
            logger.error(`Error. Comment with id=${id} not found`)
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `Comment with id=${id} not found`
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

    ctx.state.commentId = id

    await next()
}