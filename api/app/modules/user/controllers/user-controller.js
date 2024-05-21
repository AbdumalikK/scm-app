import pick from 'lodash/pick'

import { User } from '../models'
import { Following, Follower } from '../../follow/models'
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
	},

    async getContacts(ctx){
		const { 
            request: {
                query
            },
            state: { 
                user: { _id } 
            },  
        } = ctx

        if(!query.contacts || !Array.isArray(JSON.parse(query.contacts))){
            ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Contacts not passed`,
                data: null
			};
        }

		let contacts = []

        for(let i = 0; i < query.contacts.length; i++){
            try{
                const user = await User.findOne({ phone: query.contacts[i] }).select({ 
                    _id: 1,
                    username: 1,
                    firstName: 1,
                    lastName: 1,
                    verified: 1,
                    avaUri: 1
                })

                if(!user) continue

                const isFollowing = await Following.findOne({ creatorId: user._id, userId: _id })
    
                contacts.push({ ...user, isFollowing: isFollowing ? true : false })
            }catch(ex){
                logger.error(`Error. ${ex.status} ${ex.message}`)
                ctx.status = 500
                return ctx.body = {
                    success: false,
                    message: `${ex.message}`,
                    data: null
                };
            }
        }
		
        return ctx.body = {
            success: true,
            message: `Contacts`,
            data: {
                contacts
            }
        }
	},
};