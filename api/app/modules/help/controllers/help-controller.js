import pick from 'lodash/pick'

import { Help } from '../models'

import logger from '../../../utils/logs/logger'


export default {
    async getHelps(ctx){
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


        let helps = null

        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 30;
        const paginationMetaData = {}

        const select = {
            __v: 0,
            deletedAt: 0,
            active: 0
        }

        const total = await Help.countDocuments({ active: true, deletedAt: { $eq: null } }).exec()
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
            helps = await Help
                .find({ active: true, deletedAt: { $eq: null } })
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
            message: `Helps`,
            data: {
                helps
            },
            paginationMetaData
        }
	},

    async addHelp(ctx){
		const { 
            request: { 
                body: {
                    title = null,
                    payload = null
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
				message: `User id not passed`,
                data: null
			};
        }

        let help = null

		try{
			help = await Help.create({ creatorId: _id, title, payload })
		}catch(ex){
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Internal error`,
                data: null
			};
		}
		
        return ctx.body = {
            success: true,
            message: `Help added`,
            data: {
                help
            }
        }
	},

    async deleteHelp(ctx){
		const { 
            state: {
                user: {
                    _id
                },
                id
            }
        } = ctx

		try{
            await Help.findByIdAndUpdate(id, { $set: {  active: false, deletedAt: new Date() } })            
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
            message: 'Help successfully deleted',
            data: {
                helpId: id
            }
        }
	}
};