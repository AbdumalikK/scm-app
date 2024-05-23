import pick from 'lodash/pick'

import { User } from '../models'
import { Following, Follower } from '../../follow/models'
import { Image } from '../../image/models'
import { Video } from '../../video/models'

import logger from '../../../utils/logs/logger'


export default {
	async getUser(ctx){
		const {
            state: { 
                user: { 
                    _id 
                },
                id 
            } 
        } = ctx

        if(id != _id){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `User id=${_id} does not belong to user with id=${id}`,
                data: null
			}
        }

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
				message: `Internal error`,
                data: null
			};
		}
		
        return ctx.body = {
            success: true,
            message: `User`,
            data: {
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
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `User with id=${_id} does not belong to user with id=${id}`,
                data: null
			};
        }

    
        const data = pick(body, User.createFields);

		let user = {}

		try{
			user = await User.findByIdAndUpdate(_id, { $set: data }, { new: true }).select({ 
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
				message: `Internal error`,
                data: null
			};
		}
		
        return ctx.body = {
            success: true,
            message: `User updated`,
            data: {
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
				message: `Internal error`,
                data: null
			};
		}
		
        return ctx.body = {
            success: true,
            message: `User successfully deleted`,
            data: {
                userId: _id
            }
        }
	}
};