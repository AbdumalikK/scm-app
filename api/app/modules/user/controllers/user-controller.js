import pick from 'lodash/pick'

import { User } from '../models'
import { Following, Follower } from '../../follow/models'
import { UserHistory } from '../../user-history/models'
import { Image } from '../../image/models'
import { Video } from '../../video/models'

import logger from '../../../utils/logs/logger'


export default {
	async getUser(ctx){
		const { state: { user: { _id } } } = ctx

		let user = {}

		try{
			user = await User.findById(_id).select({ 
                __v: 0,
                acive: 0,
                deletedAt: 0,
                password: 0
            })


            user['followers'] = await Follower.countDocuments({ creatorId: _id, active: true, deletedAt: { $eq: null } }).exec();
            user['following'] = await Following.countDocuments({ creatorId: _id, active: true, deletedAt: { $eq: null } }).exec();

            const images = await Image.find({ creatorId: _id, active: true })
            const videos = await Video.find({ creatorId: _id, active: true })

            const posts = [...images, ...videos].sort((a,b) => { return new Date(b.createdAt) - new Date(a.createdAt) })

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
                },
                id
            }
        } = ctx

        if(_id != id){
            logger.error(`Error. User with id=${_id} does not belong to user with id=${id}`)
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `User with id=${_id} does not belong to user with id=${id}`
			};
        }

    
        const data = pick(body, User.createFields);

		let user = {}

		try{
			user = await User.findByIdAndUpdate(_id, data).select({ 
                __v: 0,
                acive: 0,
                deletedAt: 0,
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
            message: {
                user
            }
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

    async addHistory(ctx){
		const { 
            request: { 
                body: {
                    mediaUri
                }
            },
            state: {
                user: {
                    _id
                }
            }
        } = ctx

		try{
            const user = await User.findById(_id)

            if(user){
                logger.error(`Error. User with id=${_id} not found`)
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `User with id=${_id} not found`
                };
            }

            await UserHistory.create({ 
                userFirstName: user.firstName,
                userLastName: user.lastName,
                userUsername: user.username,
                userAvaUri: user.avaUri,
                mediaUri,
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
            message: `History successfully added`
        }
	},

    async deleteHistory(ctx){
		const { 
            state: {
                historyId
            }
        } = ctx

		try{
            await UserHistory.findByIdAndUpdate(historyId, { $set: { deletedAt: new Date(), active: false } })            
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
            message: 'History successfully deleted'
        }
	},
};