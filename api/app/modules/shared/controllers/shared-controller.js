import { Shared } from '../models'

import logger from '../../../utils/logs/logger'
import { User } from '../../user/models'
import { Post } from '../../post/models'


export default {
    async getShareds(ctx){
		const { 
            request: {
                query
            },
            state: {
                user: {
                    _id
                }
            }
        } = ctx

        const page = parseInt(query.page) || 1
        const limit = parseInt(query.limit) || 30
        const paginationMetaData = {}

        const select = {
            __v: 0,
            deletedAt: 0,
            active: 0
        }

        const total = await Shared.countDocuments({ creatorId: _id, active: true, deletedAt: { $eq: null } }).exec()
        const startIndex = page === 1 ? 0 : (page - 1) * limit;
        const endIndex = page * limit;
        paginationMetaData.page = page
        paginationMetaData.totalPages = Math.ceil(total / limit)
        paginationMetaData.limit = limit
        paginationMetaData.total = total

        if (startIndex > 0){
            paginationMetaData.prevPage = page - 1
            paginationMetaData.hasPrevPage = true
        }

        if (endIndex < total) {
            paginationMetaData.nextPage = page + 1
            paginationMetaData.hasNextPage = true
        }

        let shareds = null

		try{
            shareds = await Shared
                .find({ creatorId: _id, active: true, deletedAt: { $eq: null } })
                .select(select)
                .sort({ createdAt: -1 })
                .skip(startIndex)
                .limit(limit)
		}catch(ex){
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `Internal error`,
                data: null
			};
		}
		
        return ctx.body = {
            success: true,
            message: `Shareds`,
            data: {
                shareds
            },
            paginationMetaData
        }
	},
    
    async addShared(ctx){
		const { 
            request: { 
                body: {
                    senderId = null,
                    recipientId = null,
                    postId = null

                }
            },
            state: {
                user: {
                    _id
                }
            }
        } = ctx


        if(!senderId){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `Sender id not passed`,
                data: null
            }
        }

        if(!recipientId){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `Recipient id not passed`,
                data: null
            }
        }

        if(!postId){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `Post id not passed`,
                dataq: null
            }
        }

        if(_id != senderId){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `User with id=${_id} does not belong to user with id=${senderId}`,
                data: null
            }
        }

        let shared = null

		try{
            const recipient = await User.findOne({ _id: recipientId, active: true, deletedAt: { $eq: null } })

            if(!recipient){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Recipient with id=${recipientId} not found`,
                    data: null
                }
            }

            const post = await Post.findOne({ _id: postId, active: true, deletedAt: { $eq: null } })

            if(!post){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Post with id=${postId} not found`,
                    data: null
                }
            }

            shared = await Shared.create({ creatorId: _id, senderId, recipientId, postId })
		}catch(ex){
			logger.error(`----- Error. ${ex.status}: ${ex.message} -----`)
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `${ex.message}`,
                data: null
			};
		}
		
        return ctx.body = {
            success: true,
            message: `Shared added`,
            data: {
                shared
            }
        }
	},

    async deleteShared(ctx){
		const { 
            state: {
                user: {
                    _id
                },
                id
            }
        } = ctx

		try{
            await Shared.findOneAndUpdate({ creatorId: _id, _id: id }, { $set: {  active: false, deletedAt: new Date() } })            
		}catch(ex){
			logger.error(`----- Error. ${ex.status}: ${ex.message} -----`)
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `Internal error`,
                data: null
			};
		}
		
        return ctx.body = {
            success: true,
            message: 'Shared successfully deleted',
            data: {
                sharedId: id
            }
        }
	}
};