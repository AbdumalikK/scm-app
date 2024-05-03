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
        const result = {}

        const select = {
            __v: 0,
            deletedAt: 0,
            active: 0
        }


        let reports = null

        const totalPosts = await Report.countDocuments({ active: true, deletedAt: { $eq: null } }).exec();
        const startIndex = page === 1 ? 0 : (page - 1) * limit;
        const endIndex = page * limit
        result.totalPosts = totalPosts;

        if (startIndex > 0) {
            result.previous = {
                page: page - 1,
                limit: limit
            };
        }
        if (endIndex < (await Report.countDocuments({ active: true, deletedAt: { $eq: null } }).exec())) {
            result.next = {
                page: page + 1,
                limit: limit
            };
        }

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
				message: `Internal error`
			};
		}
		
        return ctx.body = {
            success: true,
            message: {
                reports,
                pagination: result
            }
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
				message: `${ex.message}`
			};
		}
		
        return ctx.body = {
            success: true,
            message: { 
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
				message: `Internal error`
			};
		}
		
        return ctx.body = {
            success: true,
            message: 'Report successfully deleted'
        }
	}
};