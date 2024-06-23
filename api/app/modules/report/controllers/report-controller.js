import { Report } from '../models'

import logger from '../../../utils/logs/logger'


export default {
    async getReports(ctx){
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

        const total = await Report.countDocuments({ active: true, deletedAt: { $eq: null } }).exec()
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

        let reports = null

		try{
            reports = await Report
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
            message: `Reports`,
            data: {
                reports
            },
            paginationMetaData
        }
	},
    
    async addReport(ctx){
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

        const data = pick(body, Report.createFields);

        let report = null

		try{
            report = await Report.create({ ...data, creatorId: _id })
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
            message: `Report added`,
            data: {
                report
            }
        }
	},

    async deleteReport(ctx){
		const { 
            state: {
                user: {
                    _id
                },
                id
            }
        } = ctx

		try{
            await Report.findByIdAndUpdate(id, { $set: {  active: false, deletedAt: new Date() } })            
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
            message: 'Report successfully deleted',
            data: {
                reportId: id
            }
        }
	}
};