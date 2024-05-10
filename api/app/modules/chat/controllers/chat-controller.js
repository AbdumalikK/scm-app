import pick from 'lodash/pick'

import { Chat } from '../models'

import logger from '../../../utils/logs/logger'


export default {
    async addChat(ctx){
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

        let chat = null

        const data = pick(body, Chat.createFields);

		try{
            chat = await Chat.create({
                ...data,
                creatorId: _id
            })
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
                chat
            }
        }
	},

    async getChats(ctx){
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

        if(!query.senderId){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Sender id not passed`
			};
        }

        if(query.senderId != _id){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Sender id does not belong to user with id=${_id}`
			};
        }

        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 30;
        const result = {};

        const select = {
            __v: 0,
            deletedAt: 0
        };


        let chats = null

        const totalPosts = await Chat.countDocuments({ 
            senderId: query.senderId,
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
        if (endIndex < (await Chat.countDocuments({ 
            senderId: query.senderId,
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
            chats = await Chat.aggregate([
                { $match: { senderId: _id, creatorId: _id, active: true, deletedAt: { $eq: null }  } },
                { $project: { __v: 0 } },
                {
                  $lookup: {
                    from: 'users',
                    as: 'users',
                    pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$_id', _id] }] }}}, { $project: { __v: 0, password: 0, deletedAt: 0 } }]
                  }
                },
              ])
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
                chats,
                pagination: result
            }
        }
	},

    async updateChat(ctx){
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

        let chat = null

        const data = pick(body, Chat.createFields);

		try{
            chat = await Chat.findOneAndUpdate({ _id: id, creatorId: _id }, { $set: data }, { new: true }).select({ __v: 0, deletedAt: 0 })

            if(!chat){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Chat with id=${id} does not belong to user with id=${_id}`
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
                chat
            }
        }
	},

    async deleteChat(ctx){
		const { 
            state: { 
                user: {
                    _id
                },
                id
            }
        } = ctx

		try{
            const chat = await Chat.findOneAndUpdate({
                _id: id,
                creatorId: _id
            }, { 
                $set: { 
                    active: false,
                    deletedAt: new Date()
                } 
            })
            
            if(!chat){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Chat with id=${id} does not belong to user with id=${_id}`
                };
            }
		}catch(ex){
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `Internal error`
			};
		}
		
        return ctx.body = {
            success: true,
            message: 'Chat successfully deleted'
        }
	},

    async searchChat(ctx){
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

        if(!query.senderId){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Sender id not passed`
			};
        }

        if(query.senderId != _id){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Sender id does not belong to user with id=${_id}`
			};
        }

        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 30;
        const search = query.search
        const paginationMetaData = {}

        let chats = null, total = 0

        try{
            const count = await Chat.aggregate([
                { $match: { senderId: _id, creatorId: _id, active: true, deletedAt: { $eq: null }  } },
                { $project: { __v: 0 } },
                {
                  $lookup: {
                    from: 'users',
                    as: 'users',
                    pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$_id', _id] }] }, username: { $regex: search, $options: 'i' } }}]
                  }
                },
                { $count: "chats" }
              ])

              total = count[0].chats
		}catch(ex){
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `Internal error`
			};
		}

        const startIndex = page === 1 ? 0 : (page - 1) * limit
        const endIndex = page * limit
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
            chats = await Chat.aggregate([
                { $match: { senderId: _id, creatorId: _id, active: true, deletedAt: { $eq: null }  } },
                { $project: { __v: 0, deletedAt: 0 } },
                {
                  $lookup: {
                    from: 'users',
                    as: 'users',
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [{ $eq: ['$_id', _id] }]
                          },
                          username: { $regex: search, $options: 'i' }
                        }
                      },
                      {
                        $project: {
                            __v: 0,
                            password: 0,
                            deletedAt: 0
                        }
                      }
                    ]
                  }
                },
              ])
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
            message: `Search a chat`,
            data: {
                chats,
            },
            paginationMetaData
        }
	},
};