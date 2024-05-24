import { Currency } from '../models'

import logger from '../../../utils/logs/logger'


export default {
    async getCurrencies(ctx){
		const {
            state: {
                user: {
                    _id
                }
            }
        } = ctx

        
        let currencies = null

		try{
            currencies = await Currency.find().select({ __v: 0 })
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
            message: `Currencies`,
            data: {
                currencies
            }
        }
	},
    
    async addCurrency(ctx){
		const { 
            request: { 
                body: {
                    exchangeRate = null
                }
            },
            state: {
                user: {
                    _id
                }
            }
        } = ctx

        if(!exchangeRate){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `Exchange rate not found`,
                data: null
            }
        }

        let currency = null

		try{
            currency = await Currency.create({ creatorId: _id, exchangeRate })
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
            message: `Currency added`,
            data: {
                currency
            }
        }
	},

    async deleteCurrency(ctx){
		const { 
            state: {
                user: {
                    _id
                },
                id
            }
        } = ctx

		try{
            await Currency.findOneAndDelete({ creatorId: _id, _id: id })            
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
            message: 'Currency successfully deleted',
            data: {
                currencyId: id
            }
        }
	}
};