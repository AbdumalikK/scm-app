import { Story } from '../models'

import logger from '../../../utils/logs/logger'


export default {
    async getStories(ctx){
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

        const total = await Story.countDocuments({ creatorId: _id, active: true, deletedAt: { $eq: null } }).exec()
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

        let stories = null

		try{
            stories = await Story
                .find({ creatorId: _id, active: true, deletedAt: { $eq: null } })
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
            message: `Stories`,
            data: {
                stories
            },
            paginationMetaData
        }
	},
    
    async addStory(ctx){
		const { 
            request: { 
                body: {
                    mediaUri
                }
            },
            state: {
                user: {
                    _id
                }
            }
        } = ctx

        let story = null

		try{
            story = await Story.create({ 
                mediaUri,
                creatorId: _id
            })
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
            message: `Story added`,
            data: {
                story
            }
        }
	},

    async deleteStory(ctx){
		const { 
            state: {
                user: {
                    _id
                },
                id
            }
        } = ctx

		try{
            await Story.findOneAndUpdate({ creatorId: _id, _id: id }, { $set: {  active: false, deletedAt: new Date() } })            
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
            message: 'Story successfully deleted',
            data: {
                storyId: id
            }
        }
	},

        
    async updateStoryLike(ctx){
		const {
            state: {
                user: {
                    _id
                },
                id
            }
        } = ctx

        let story = null

        const like = {
            creatorId: _id,
            createdAt: new Date()
        }

		try{
            story = await Story.findOneAndUpdate(
                { 
                    _id: id,
                    creatorId: _id,
                    active: true,
                    deletedAt: { $eq: null }
                },
                { $push: { like } },
                { new: true }
            )
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
            message: `Story like updated`,
            data: {
                story
            }
        }
	},

    async deleteStoryLike(ctx){
		const {
            state: {
                user: {
                    _id
                },
                id,
                likeId
            }
        } = ctx

		let story = {}

		try{
			story = await Story.findOneAndUpdate(
                { 
                    _id: id, 
                    creatorId: _id, 
                    'like._id': likeId 
                }, 
                { 
                    $set: { 
                        'like.$.active': false, 
                        'like.$.deletedAt': new Date() 
                    } 
                }, 
                { new: true }
            ).select({ __v: 0 })

            if(!story){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Story with id=${id} & creatorId=${_id} & likeId=${likeId} not found`,
                    data: null
                };
            }
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
            message: `Story like deleted`,
            data: {
                story
            }
        }
	},
};