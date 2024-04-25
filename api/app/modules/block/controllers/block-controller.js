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

        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 30;
        const result = {};

        const select = {
            __v: 0,
            deletedAt: 0,
            active: 0
        };

        const totalPosts = await Block.countDocuments({ creatorId: _id, active: true, deletedAt: { $eq: null } }).exec()
        const startIndex = page === 1 ? 0 : (page - 1) * limit;
        const endIndex = page * limit;
        result.totalPosts = totalPosts;

        if (startIndex > 0) {
            result.previous = {
                page: page - 1,
                limit: limit
            };
        }
        if (endIndex < (await Block.countDocuments({ creatorId: _id, active: true, deletedAt: { $eq: null } }).exec())) {
            result.next = {
                page: page + 1,
                limit: limit
            };
        }

		try{
            blockedUsers = await Block
                .find({ creatorId: _id, active: true, deletedAt: { $eq: null } })
                .select(select)
                .sort({ createdAt: -1 })
                .skip(startIndex)
                .limit(limit)
		}catch(ex){
			logger.error(`----- Error. ${ex.status}: ${ex.message} -----`)
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `Internal error`
			};
		}
		
        return ctx.body = {
            success: true,
            message: {
                blockedUsers,
                pagination: result
            }
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
            logger.error(`Error. User id not passed`)
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `User id not passed`
			};
        }

        let blockedUser = null

		try{
            blockedUser = await Block.findOne({ creatorId: _id, userId })

            if(blockedUser){
                logger.error(`Error. User with id=${userId} already blocked`)
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `User with id=${userId} already blocked`
                };
            }

			blockedUser = await Block.create({ creatorId: _id, userId })
		}catch(ex){
			logger.error(`Error. ${ex.status} ${ex.message}`)
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Internal error`
			};
		}
		
        return ctx.body = {
            success: true,
            message: {
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
            logger.error(`Error. UserId not passed`)
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `UserId not passed`
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
                logger.error(`Error. Blocked user with userId=${userId} not found`)
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Blocked user with userId=${userId} not found`
                };
            }
		}catch(ex){
			logger.error(`Error. ${ex.status} ${ex.message}`)
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Internal error`
			};
		}
		
        return ctx.body = {
            success: true,
            message: {
                unblockedUser
            }
        }
	}
};