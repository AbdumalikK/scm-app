import { TargetAudience } from '../models'

import logger from '../../../utils/logs/logger'


export default {
    async getTargetAudiences(ctx){
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

        const select = {
            __v: 0,
            deletedAt: 0,
            active: 0
        }

        let targetAudiences = null

		try{
            targetAudiences = await TargetAudience.find({ creatorId: _id, active: true, deletedAt: { $eq: null } }).select(select)
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
            message: `Target audiences`,
            data: {
                targetAudiences
            }
        }
	},

    async deleteTargetAudience(ctx){
		const { 
            state: {
                user: {
                    _id
                },
                id
            }
        } = ctx

		try{
            await TargetAudience.findOneAndUpdate({ creatorId: _id, _id: id }, { $set: {  active: false, deletedAt: new Date() } })            
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
            message: 'Target audience successfully deleted',
            data: {
                targetAudienceId: id
            }
        }
	}
};