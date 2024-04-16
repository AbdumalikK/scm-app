import pick from 'lodash/pick'

import { User } from '../models'
import { UserFollow } from '../../user-follow/models'
import { UserBlock } from '../../user-block/models'
import { Image } from '../../image/models'
import { Video } from '../../video/models'

import logger from '../../../utils/logs/logger'
import { FOLLOWERS, FOLLOWING } from '../constants';


export default {
	async getUser(ctx){
		const { request: { state: { id } } } = ctx

		let user = {}

		try{
			user = await User.findById(id).select({ 
                __v: 0,
                acive: 0,
                password: 0
            })

            user['followers'] = await UserFollow.countDocuments({ creatorId: id, type: FOLLOWERS, active: true }).exec();
            user['following'] = await UserFollow.countDocuments({ creatorId: id, type: FOLLOWING, active: true }).exec();

            const images = await Image.countDocuments({ creatorId: _id, active: true }).exec()
            const videos = await Video.countDocuments({ creatorId: _id, active: true }).exec()

            const posts = [...images, ...videos].sort({ createdAt: -1 })

            user['posts'] = posts

            user['reels'] = await Video.countDocuments({ creatorId: _id, active: true }).exec()            
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
                user
            }
        }
	},

    async updateUser(ctx){
		const { 
            request: { 
                body
            },
            state: {
                user: {
                    _id
                }
            }
        } = ctx

        if(_id !== data.userId){
            logger.error(`Error. User with id=${_id} does not belong to user with id=${data.userId}`)
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `User with id=${_id} does not belong to user with id=${data.userId}`
			};
        }

    
        const data = pick(body, User.createFields);

		let user = {}

		try{
			user = await User.findByIdAndUpdate(_id, data).select({ 
                __v: 0,
                acive: 0,
                password: 0
            })
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
            message: `User successfully updated`
        }
	},

    async deleteUser(ctx){
		const {
            state: {
                user: {
                    _id
                }
            }
        } = ctx
    
		try{
			await User.findByIdAndUpdate(_id, { $set: { active: false, deletedAt: new Date() } }).select()
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
            message: `User successfully deleted`
        }
	},

    async getFollows(ctx){
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


        let follows = null

        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 30;
        const sort = query.sort
        const result = {};

        const select = {
            __v: 0,
            deletedAt: 0,
            active: 0
        };

        const totalPosts = await UserFollow.countDocuments({ active: true }).exec();
        const startIndex = page === 1 ? 0 : (page - 1) * limit;
        const endIndex = page * limit;
        result.totalPosts = totalPosts;

        if (startIndex > 0) {
            result.previous = {
                page: page - 1,
                limit: limit
            };
        }
        if (endIndex < (await UserFollow.countDocuments({ active: true }).exec())) {
            result.next = {
                page: page + 1,
                limit: limit
            };
        }

		try{
            follows = await UserFollow
                .find({ creator_id: _id, active: true, deletedAt: { $eq: null } })
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
                follows,
                pagination: result
            }
        }
	},

    async addFollow(ctx){
		const { 
            request: { 
                body: {
                    type = null,
                    userId = null,
                    creatorId = null
                }
            },
            state: {
                user: {
                    _id
                }
            }
        } = ctx


        if(user._id !== creatorId){
            logger.error(`Error. User with id=${_id} does not belong to user with id=${userId}`)
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `User with id=${_id} does not belong to user with id=${userId}`
			};
        }

        if(type !== FOLLOWERS || type !== FOLLOWING){
            logger.error(`Error. type=${userId} not equal to ${FOLLOWERS} or ${FOLLOWING}`)
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Validation error`
			};
        }

        if(!userId){
            logger.error(`Error. userId=${userId}`)
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Validation error`
			};
        }

		try{
            const user = await User.findById(userId)

            if(user){
                logger.error(`Error. User with id=${userId} not found`)
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `User with id=${userId} not found`
                };
            }

            await UserFollow.create({ 
                type, 
                userId,
                userFirstName: user.firstName,
                userLastName: user.lastName,
                userUsername: user.username,
                userAvaUri: user.avaUri,
                creatorId
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
            message: `User successfully updated`
        }
	},

    async deleteFollow(ctx){
		const { 
            state: { 
                type,
                creatorId,
                userId
            }
        } = ctx

		try{
            await UserFollow.findOneAndUpdate({ 
                type, 
                creatorId, 
                userId 
            }, { 
                $set: { 
                    deletedAt: new Date(),
                    active: false
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
            message: 'Follow successfully updated'
        }
	},

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

        const totalPosts = await UserBlock.countDocuments({ active: true }).exec();
        const startIndex = page === 1 ? 0 : (page - 1) * limit;
        const endIndex = page * limit;
        result.totalPosts = totalPosts;

        if (startIndex > 0) {
            result.previous = {
                page: page - 1,
                limit: limit
            };
        }
        if (endIndex < (await UserBlock.countDocuments({ active: true }).exec())) {
            result.next = {
                page: page + 1,
                limit: limit
            };
        }

		try{
            blockedUsers = await UserBlock
                .find({ creator_id: _id, active: true, deletedAt: { $eq: null } })
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
                body
            },
            state: {
                user: {
                    _id
                }
            }
        } = ctx

        if(_id !== data.userId){
            logger.error(`Error. User with id=${_id} does not belong to user with id=${data.userId}`)
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `User with id=${_id} does not belong to user with id=${data.userId}`
			};
        }

        const data = {
            creatorId: _id,
            ...body
        }

		try{
			await UserBlock.create(data)
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
            message: `User successfully blocked`
        }
	},

    async unblockUser(ctx){
		const {
            state: {
                user: {
                    _id
                },
                userBlockId
            }
        } = ctx

        if(_id !== data.userId){
            logger.error(`Error. User with id=${_id} does not belong to user with id=${data.userId}`)
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `User with id=${_id} does not belong to user with id=${data.userId}`
			};
        }

		try{
			await UserBlock.findByIdAndUpdate(userBlockId, { $set: { active: false, deletedAt: new Date() } })
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
            message: `User successfully unblocked`
        }
	},
};