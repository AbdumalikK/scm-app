import pick from 'lodash/pick'

import { Message } from '../models'
import { Follower, Following } from '../models'

import logger from '../../../utils/logs/logger'


export default {
    async getMessages(ctx){
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

        if(!query.chatId){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Chat id not passed`
			};
        }

        if(!query.senderId){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Sender id not passed`
			};
        }

        if(!query.recipientId){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Recipient id not passed`
			};
        }

        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 30;
        const result = {};

        const select = {
            __v: 0,
            deletedAt: 0,
            active: 0
        };


        let messages = null

        const totalPosts = await Message.countDocuments({ 
            senderId: query.senderId,
            recipientId: query.recipientId,
            chatId: query.chatId,
            creatorId: _id,
            active: true, 
            deletedAt: { $eq: null } 
        }).exec();
        const startIndex = page === 1 ? 0 : (page - 1) * limit;
        const endIndex = page * limit;
        result.totalPosts = totalPosts;

        if (startIndex > 0) {
            result.previous = {
                page: page - 1,
                limit: limit
            };
        }
        if (endIndex < (await Message.countDocuments({ 
            senderId: query.senderId,
            recipientId: query.recipientId,
            chatId: query.chatId,
            creatorId: _id,
            active: true, 
            deletedAt: { $eq: null } 
         }).exec())) {
            result.next = {
                page: page + 1,
                limit: limit
            };
        }

		try{
            messages = await Message
                .find({
                    senderId: query.senderId,
                    recipientId: query.recipientId, 
                    chatId: query.chatId,
                    creatorId: _id,
                    active: true, 
                    deletedAt: { $eq: null }
                 })
                .select(select)
                .sort({ createdAt: -1 })
                .skip(startIndex)
                .limit(limit)
		}catch(ex){
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `Internal error`
			};
		}
		
        return ctx.body = {
            success: true,
            message: {
                messages,
                pagination: result
            }
        }
	},
    
    async addMessage(ctx){
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

        let message = null

        const data = pick(body, Message.createFields);

		try{
            message = await Message.create({
                ...data,
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
                message
            }
        }
	},

    async updateMessage(ctx){
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

        let message = null

        const data = pick(body, Message.createFields);

		try{
            message = await Message.findOneAndUpdate({ _id: id, creatorId: _id }, { $set: data }, { new: true }).select({ __v: 0, deletedAt: 0 })

            if(!message){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Message with id=${id} does not belong to user with id=${_id}`
                };
            }
		}catch(ex){
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `${ex.message}`
			};
		}
		
        return ctx.body = {
            success: true,
            message: {
                message
            }
        }
	},

    async deleteMessage(ctx){
		const { 
            state: { 
                user: {
                    _id
                },
                id
            }
        } = ctx

		try{
            await Message.findOneAndUpdate({
                _id: id,
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
            message: 'Message successfully deleted'
        }
	},
};