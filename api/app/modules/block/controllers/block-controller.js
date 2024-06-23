import pick from 'lodash/pick'

import { User } from '../../user/models'
import { Block } from '../models'

import logger from '../../../utils/logs/logger'


export default {
    async getBlockedUsers(ctx){
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


        let blockedUsers = null

        const page = parseInt(query.page) || 1
        const limit = parseInt(query.limit) || 30
        const paginationMetaData = {}

        const select = {
            __v: 0,
            deletedAt: 0,
            active: 0
        }

        const total = await Block.countDocuments({ creatorId: _id, active: true, deletedAt: { $eq: null } }).exec()
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

		try{
            blockedUsers = await Block
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
            message: `Blocked users`,
            data: {
                blockedUsers,
            },
            paginationMetaData
        }
	},

    async blockUser(ctx){
		const { 
            request: { 
                body: {
                    userId = null
                }
            },
            state: {
                user: {
                    _id
                }
            }
        } = ctx

        if(!userId){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `User id not passed`,
				data: null
			};
        }

        let blockedUser = null

		try{
            blockedUser = await Block.findOne({ creatorId: _id, userId })

            if(blockedUser){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `User with id=${userId} already blocked`,
                    data: null
                };
            }

			blockedUser = await Block.create({ creatorId: _id, userId })
		}catch(ex){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Internal error`,
				data: null
			};
		}
		
        return ctx.body = {
            success: true,
            message: `User blocked`,
            data: {
                blockedUser
            }
        }
	},

    async unblockUser(ctx){
		const {
            request: {
                body: {
                    userId = null
                }
            },
            state: {
                user: {
                    _id
                },
            }
        } = ctx

        if(!userId){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `UserId not passed`,
				data: null
			};
        }

        let unblockedUser = null

		try{
			unblockedUser = await Block.findOneAndUpdate(
                { 
                    creatorId: _id, 
                    userId,
                    active: true,
                    deletedAt: { $eq: null }
                }, 
                { 
                    $set: { 
                        active: false, 
                        deletedAt: new Date() 
                    } 
                }
            ).select({ __v: 0, active: 0, deletedAt: 0 })

            if(!unblockedUser){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Blocked user with userId=${userId} not found`,
                    data: null
                };
            }
		}catch(ex){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Internal error`,
				data: null
			};
		}
		
        return ctx.body = {
            success: true,
            message: `User unblocked`,
            data: {
                unblockedUser
            }
        }
	}
};