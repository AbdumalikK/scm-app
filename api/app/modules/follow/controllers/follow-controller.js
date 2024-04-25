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
        const sort = query.sort
        const result = {};

        const select = {
            __v: 0,
            deletedAt: 0,
            active: 0
        };

        const totalPosts = await Following.countDocuments({ creatorId: _id, active: true, deletedAt: { $eq: null } }).exec();
        const startIndex = page === 1 ? 0 : (page - 1) * limit;
        const endIndex = page * limit;
        result.totalPosts = totalPosts;

        if (startIndex > 0) {
            result.previous = {
                page: page - 1,
                limit: limit
            };
        }
        if (endIndex < (await Following.countDocuments({ creatorId: _id, active: true, deletedAt: { $eq: null } }).exec())) {
            result.next = {
                page: page + 1,
                limit: limit
            };
        }

		try{
            followings = await Following
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
                followings,
                pagination: result
            }
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
            logger.error(`Error. userId=${userId}`)
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Validation error`
			};
        }

        let following = null

		try{
            const user = await User.findById(userId)

            if(!user){
                logger.error(`Error. User with id=${userId} not found`)
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `User with id=${userId} not found`
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
				message: `${ex.message}`
			};
		}
		
        return ctx.body = {
            success: true,
            message: {
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
				message: `Internal error`
			};
		}
		
        return ctx.body = {
            success: true,
            message: 'Following successfully deleted'
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
        const sort = query.sort
        const result = {};

        const select = {
            __v: 0,
            deletedAt: 0,
            active: 0
        };

        const totalPosts = await Follower.countDocuments({ userId: _id, active: true, deletedAt: { $eq: null } }).exec();
        const startIndex = page === 1 ? 0 : (page - 1) * limit;
        const endIndex = page * limit;
        result.totalPosts = totalPosts;

        if (startIndex > 0) {
            result.previous = {
                page: page - 1,
                limit: limit
            };
        }
        if (endIndex < (await Follower.countDocuments({ userId: _id, active: true, deletedAt: { $eq: null } }).exec())) {
            result.next = {
                page: page + 1,
                limit: limit
            };
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
				message: `Internal error`
			};
		}
		
        return ctx.body = {
            success: true,
            message: {
                followers,
                pagination: result
            }
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
    //         logger.error(`Error. userId=${userId}`)
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
    //             logger.error(`Error. User with id=${userId} not found`)
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
	// 		logger.error(`----- Error. ${ex.status}: ${ex.message} -----`)
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
				message: `Internal error`
			};
		}
		
        return ctx.body = {
            success: true,
            message: 'Follower successfully deleted'
        }
	},
};