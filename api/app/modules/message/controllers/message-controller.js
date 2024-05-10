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
        const paginationMetaData = {}

        const select = {
            __v: 0,
            deletedAt: 0,
            active: 0
        }

        const total = await Message.countDocuments({ 
            senderId: query.senderId,
            recipientId: query.recipientId,
            chatId: query.chatId,
            creatorId: _id,
            active: true, 
            deletedAt: { $eq: null } 
        }).exec()
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

        let messages = null

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
				message: `Internal error`,
                data: null
			};
		}
		
        return ctx.body = {
            success: true,
            message: `Messages`,
            data: {
                messages,
            },
            paginationMetaData
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
				message: `${ex.message}`,
                data: null
			};
		}
		
        return ctx.body = {
            success: true,
            message: `Message added`,
            data: {
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
                    message: `Message with id=${id} does not belong to user with id=${_id}`,
                    data: null
                };
            }
		}catch(ex){
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `${ex.message}`,
                data: null
			};
		}
		
        return ctx.body = {
            success: true,
            message: `Message updated`,
            data: {
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
                message: `Internal error`,
                data: null
            };
        }
        
        return ctx.body = {
            success: true,
            message: 'Message successfully deleted',
            data: {
                messageId: id
            }
        }
    },
};