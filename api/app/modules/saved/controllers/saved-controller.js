import { Saved } from '../models'

import logger from '../../../utils/logs/logger'


export default {
    async getSaveds(ctx){
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

        const page = parseInt(query.page) || 1
        const limit = parseInt(query.limit) || 30
        const result = {}

        const select = {
            __v: 0,
            deletedAt: 0,
            active: 0
        }


        let saveds = null

        const totalPosts = await Saved.countDocuments({ creatorId: _id, active: true, deletedAt: { $eq: null } }).exec();
        const startIndex = page === 1 ? 0 : (page - 1) * limit;
        const endIndex = page * limit;
        result.totalPosts = totalPosts;

        if (startIndex > 0) {
            result.previous = {
                page: page - 1,
                limit: limit
            };
        }
        if (endIndex < (await Saved.countDocuments({ creatorId: _id, active: true, deletedAt: { $eq: null } }).exec())) {
            result.next = {
                page: page + 1,
                limit: limit
            };
        }

		try{
            saveds = await Saved
                .find({ creatorId: _id, active: true, deletedAt: { $eq: null } })
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
                saveds,
                pagination: result
            }
        }
	},
    
    async addSaved(ctx){
		const { 
            request: { 
                body: {
                    postId
                }
            },
            state: {
                user: {
                    _id
                }
            }
        } = ctx

        let saved = null

		try{
            saved = await Saved.create({ postId, creatorId: _id })
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
                saved
            }
        }
	},

    async deleteSaved(ctx){
		const { 
            state: {
                user: {
                    _id
                },
                id
            }
        } = ctx

		try{
            await Saved.findOneAndUpdate({ creatorId: _id, _id: id }, { $set: {  active: false, deletedAt: new Date() } })            
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
            message: 'Saved successfully deleted'
        }
	}
};