import { Phonebook } from '../models'
import { User } from '../../user/models'
import { Following } from '../../follow/models'

import logger from '../../../utils/logs/logger'


export default {
    async getFriends(ctx){
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

        const total = await Phonebook.countDocuments({ creatorId: _id }).exec()
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

        const select = {
            _id: 1,
            username: 1,
            firstName: 1,
            lastName: 1,
            verified: 1,
            avaUri: 1
        }

		let friends = []

        try{
            const phonebooks = await Phonebook.find({ creatorId: _id })
                .skip(startIndex)
                .limit(limit)
                .sort({ createdAt: -1 })

            for(let j = 0; j < phonebooks.length; j++){
                const user = await User.findOne({ phone: { $regex: phonebooks[j].phone, $options: 'i' }, active: true, deletedAt: { $eq: null } }).select(select)

                if(!user) continue
            
                const isFollowing = await Following.findOne({ creatorId: user._id, userId: _id })

                friends.push({ ...user._doc, isFollowing: isFollowing ? true : false })
            } 
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
            message: `Friends`,
            data: {
                friends
            },
            paginationMetaData
        }
	},
    
    async addPhonebook(ctx){
		const { 
            request: { 
                body: {
                    contacts
                }
            },
            state: {
                user: {
                    _id
                }
            }
        } = ctx

        if(!contacts || !Array.isArray(contacts)){
            ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Contacts not passed`,
                data: null
			};
        }

        let phonebooks = []

        for(let i = 0; i < contacts.length; i++){
            try{
                const phonebook = await Phonebook.create({ phone: contacts[i], creatorId: _id })

                phonebooks.push(phonebook)
            }catch(ex){
                logger.error(`----- Error. ${ex.status}: ${ex.message} -----`)
                ctx.status = 500
                return ctx.body = {
                    success: false,
                    message: `${ex.message}`,
                    data: null
                };
            }
        }
		
		
        return ctx.body = {
            success: true,
            message: `Phonebook added`,
            data: {
                phonebooks
            }
        }
	},

    async deletePhonebooks(ctx){
		const { 
            state: {
                user: {
                    _id
                }
            }
        } = ctx

		try{
            await Phonebook.remove({ creatorId: _id })            
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
            message: 'Phonebooks successfully deleted',
            data: null
        }
	}
};