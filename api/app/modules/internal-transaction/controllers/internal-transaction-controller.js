import pick from 'lodash/pick'

import { InternalTransaction } from '../models'
import { Currency } from '../../currency/models'
import { Wallet } from '../../wallet/models'

import logger from '../../../utils/logs/logger'
import { SOM } from '../constants'


export default {
    async getInternalTransactions(ctx){
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

        const total = await InternalTransaction.countDocuments({ creatorId: _id }).exec()
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

        let internalTransactions = null

		try{
            internalTransactions = await InternalTransaction
                .find({ creatorId: _id })
                .select({ __v: 0 })
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
            message: `Internal transactions`,
            data: {
                internalTransactions
            },
            paginationMetaData
        }
	},
    
    async addInternalTransaction(ctx){
		const { 
            request: { 
                body: {
                    senderId = null,
                    recipientId = null,
                    coin = 0
                }
            },
            state: {
                user: {
                    _id
                }
            }
        } = ctx

        if(!senderId){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `SenderId not passed`,
                data: null
            };
        }

        if(!recipientId){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `RecipientId not passed`,
                data: null
            }
        }

        if(!coin){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `Coin not passed`,
                data: null
            }; 
        }

        // if sender and recipient with the same id
        if(senderId == recipientId){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `Choose recipient`
            }
        }

        // if sender is not equal to user from token
        if(_id != senderId){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `User id=${_id} does not belong to user with id=${senderId}`
            }
        }

        // logic starts
        let internalTransaction = null

		try{
            let senderWallet = await Wallet.findOne({ creatorId: senderId })

            if(!senderWallet){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Sender wallet not found`,
                    data: null
                };
            }

            let recipientWallet = await Wallet.findOne({ creatorId: recipientId })

            if(!recipientWallet){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Recipient wallet not found`,
                    data: null
                }
            }

            if(senderWallet.coin < coin){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Sender does not have enough money to transfer`,
                    data: null
                };
            }

            // update sender wallet
            senderWallet.coin += -coin

            // update recipoient wallet
            recipientWallet.coin += coin

            const currency = await Currency.find()

            if(!currency.length){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: 'Currency not found',
                    data: null
                }
            }

            const amount = coin * currency[0].exchangeRate

            internalTransaction = await InternalTransaction.create({ 
                creatorId: _id,
                senderId,
                senderWalletId: senderWallet._id,
                recipientId,
                recipientWalletId: recipientWallet._id,
                coin,
                exchangeRate: currency[0].exchangeRate,
                currency: SOM,
                amount
            })

            // save calculated coin 
            await senderWallet.save()
            await recipientWallet.save()
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
            message: `Internal transaction added`,
            data: {
                internalTransaction
            }
        }
	},

    async convertCoin(ctx){
		const { 
            request: {
                body: {
                    coin = null
                }
            },
            state: {
                user: {
                    _id
                }
            }
        } = ctx

        if(!coin){
            ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Coin not passed`,
                data: null
			};
        }

        let amount = 0, type = null

		try{
            const currency = await Currency.find()

            if(!currency.length){
                ctx.status = 404
                return ctx.body = {
                    success: false,
                    message: `Currency not found`,
                    data: null
                };
            }

            amount = coin * currency[0].exchangeRate
            type = SOM
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
            message: `Converted coin`,
            data: {
                amount,
                type
            }
        }
	},

    async walletBalance(ctx){
		const { 
            request: {
                query: {
                    userId = null
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
				message: `Coin not passed`,
                data: null
			};
        }

        if(_id != userId){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `User with id=${_id} does not beong to user with id=${userId}`
            }
        }

        let coin = 0

		try{
            const wallet = await Wallet.findOne({ creatorId: _id })

            if(!wallet){
                ctx.status = 404
                return ctx.body = {
                    success: false,
                    message: `Wallet not found`,
                    data: null
                };
            }

            coin = wallet.coin
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
            message: `Balance`,
            data: {
                coin
            }
        }
	}
};