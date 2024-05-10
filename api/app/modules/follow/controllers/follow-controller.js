import pick from 'lodash/pick'

import { User } from '../../user/models'
import { Follower, Following } from '../models'

import logger from '../../../utils/logs/logger'


export default {
    async getFollowings(ctx){
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


        let followings = null

        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 30;
        const paginationMetaData = {}

        const select = {
            __v: 0,
            deletedAt: 0,
            active: 0
        }

        const total = await Following.countDocuments({ creatorId: _id, active: true, deletedAt: { $eq: null } }).exec()
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
            followings = await Following
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
            message: `Followings`,
            data: {
                followings,
            },
            paginationMetaData
        }
	},

    async addFollowing(ctx){
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
				message: `Validation error`,
                data: null
			};
        }

        let following = null

		try{
            const user = await User.findById(userId)

            if(!user){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `User with id=${userId} not found`,
                    data: null
                };
            }

            following = await Following.create({
                userId,
                creatorId: _id
            })
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
            message: `Following added`,
            data: {
                following
            }
        }
	},

    async deleteFollowing(ctx){
		const { 
            state: { 
                followingId,
                user: {
                    _id
                }
            }
        } = ctx

		try{
            await Following.findOneAndUpdate({
                _id: followingId,
                creatorId: _id
            }, { 
                $set: { 
                    active: false,
                    deletedAt: new Date()
                } 
            })            
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
            message: 'Following successfully deleted',
            data: {
                followingId
            }
        }
	},




    async getFollowers(ctx){
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


        let followers = null

        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 30;
        const paginationMetaData = {}

        const select = {
            __v: 0,
            deletedAt: 0,
            active: 0
        }

        const total = await Follower.countDocuments({ userId: _id, active: true, deletedAt: { $eq: null } }).exec()
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
            followers = await Follower
                .find({ userId: _id, active: true, deletedAt: { $eq: null } })
                .select(select)
                .sort({ createdAt: -1 })
                .skip(startIndex)
                .limit(limit)
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
            message: `Followers`,
            data: {
                followers,
            },
            paginationMetaData
        }
	},

    // async addFollower(ctx){
	// 	const { 
    //         request: { 
    //             body: {
    //                 userId = null
    //             }
    //         },
    //         state: {
    //             user: {
    //                 _id
    //             }
    //         }
    //     } = ctx

    //     if(!userId){
	// 		ctx.status = 400
	// 		return ctx.body = {
	// 			success: false,
	// 			message: `Validation error`
	// 		};
    //     }

    //     let following = null

	// 	try{
    //         const user = await User.findById(userId)

    //         if(!user){
    //             ctx.status = 400
    //             return ctx.body = {
    //                 success: false,
    //                 message: `User with id=${userId} not found`
    //             };
    //         }

    //         following = await Following.create({
    //             userId,
    //             creatorId: _id
    //         })
	// 	}catch(ex){
	// 		ctx.status = 500
	// 		return ctx.body = {
	// 			success: false,
	// 			message: `${ex.message}`
	// 		};
	// 	}
		
    //     return ctx.body = {
    //         success: true,
    //         message: {
    //             following
    //         }
    //     }
	// },

    async deleteFollower(ctx){
		const { 
            state: { 
                followerId,
                user: {
                    _id
                }
            }
        } = ctx

		try{
            await Follower.findOneAndUpdate({
                _id: followerId,
                creatorId: _id
            }, { 
                $set: { 
                    active: false,
                    deletedAt: new Date()
                } 
            })            
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
            message: 'Follower successfully deleted',
            data: {
                followerId
            }
        }
	},
};