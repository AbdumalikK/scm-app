import { Interest } from '../models'

import logger from '../../../utils/logs/logger'


export default {
    async getInterest(ctx){
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
        const paginationMetaData = {}

        const select = {
            __v: 0,
            deletedAt: 0,
            active: 0
        }

        const total = await Interest.countDocuments({ active: true, deletedAt: { $eq: null } }).exec()
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

        let interest = null

		try{
            interest = await Interest
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
            message: `Interest`,
            data: {
                interest
            },
            paginationMetaData
        }
	},
    
    async addInterest(ctx){
		const { 
            request: { 
                body: {
                    name = null
                }
            },
            state: {
                user: {
                    _id
                }
            }
        } = ctx

        let interest = null

		try{
            interest = await Interest.create({ name, creatorId: _id })
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
            message: `Interest added`,
            data: {
                interest
            }
        }
	},

    async deleteInterest(ctx){
		const { 
            state: {
                user: {
                    _id
                },
                id
            }
        } = ctx

		try{
            await Interest.findOneAndUpdate({ _id: id }, { $set: {  active: false, deletedAt: new Date() } })            
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
            message: 'Interst successfully deleted',
            data: {
                interestId: id
            }
        }
	},


    async search(ctx){
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
    
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 30;
        const search = query.search
        const paginationMetaData = {}
    
        const startIndex = page === 1 ? 0 : (page - 1) * limit;
        const endIndex = page * limit;
        paginationMetaData.page = page
        paginationMetaData.limit = limit
    
        if (startIndex > 0){
          paginationMetaData.prevPage = page - 1
          paginationMetaData.hasPrevPage = true
        }
    
        let interests = null

        const total = await Interest.countDocuments({ name: { $regex: search, $options: 'i' }, active: true, deletedAt: { $eq: null }  }).exec()
        paginationMetaData.totalPages = Math.ceil(total / limit)
        paginationMetaData.total = total

        if (endIndex < total) {
            paginationMetaData.nextPage = page + 1
            paginationMetaData.hasNextPage = true
        }

        try{
            interests = await Interest.find({ name: { $regex: search, $options: 'i' }, active: true, deletedAt: { $eq: null }  })
                .select({ __v: 0, deletedAt: 0 })
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
          message: `Interests`,
          data: {
            interests
          },
          paginationMetaData
        }
    },
};