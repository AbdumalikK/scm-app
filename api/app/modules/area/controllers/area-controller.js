import { Area } from '../models'
import mongoose from 'mongoose'

import logger from '../../../utils/logs/logger'


export default {
    async getAreas(ctx){
		const {
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

        let areas = null

		try{
            areas = await Area
                .find({ active: true, deletedAt: { $eq: null } })
                .select(select)
                .sort({ createdAt: 1 })
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
            message: `Areas`,
            data: {
                areas
            }
        }
	},
    
    async addArea(ctx){
		const { 
            request: { 
                body: {
                    country = null,
                    isoCode = null,
                    state = null
                }
            },
            state: {
                user: {
                    _id
                }
            }
        } = ctx


        if(!state || !Array.isArray(state)){
            ctx.status = 500
			return ctx.body = {
				success: false,
				message: `State not found`,
                data: null
			};
        }

        let area = null

        for(let i = 0; i < state.length; i++){
            state[i]['_id'] = new mongoose.Types.ObjectId()
            for(let j = 0; j < state[i].city.length; j++){
                state[i].city[j]['_id'] = new mongoose.Types.ObjectId()
            }
        }

		try{
            area = await Area.create({ country, isoCode, state, creatorId: _id })
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
            message: `Area added`,
            data: {
                area
            }
        }
	},

    async deleteArea(ctx){
		const { 
            state: {
                user: {
                    _id
                },
                id
            }
        } = ctx

		try{
            await Area.findOneAndUpdate({ _id: id }, { $set: {  active: false, deletedAt: new Date() } })            
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
            message: 'Area successfully deleted',
            data: {
                areaId: id
            }
        }
	}
};