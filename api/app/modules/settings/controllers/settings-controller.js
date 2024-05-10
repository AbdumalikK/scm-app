import { User } from '../../user/models'
import { Privacy } from '../../privacy/models'
import { Post } from '../../post/models'

export default {
    async getArchives(ctx){
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

        const total = await Post.find({ creatorId: _id, active: false, deletedAt: { $eq: null } }).exec()
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

        let archives = null

		try{
            archives = await Post.find({ creatorId: _id, active: false, deletedAt: { $eq: null } })
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
            message: `Archives`,
            data: {
                archives
            },
            paginationMetaData
        }
	},

    async getPrivacy(ctx){
		const { 
            state: {
                user: {
                    _id
                }
            }
        } = ctx

        let user = null

		try{
            user = await User.aggregate([
                { $match: { _id, active: true, deletedAt: { $eq: null }  } },
                { $project: { __v: 0 } },
                {
                    $lookup: {
                    from: 'privacies',
                    as: 'privacy',
                    pipeline: [
                        {
                        $match: {
                            $expr: {
                            $and: [{ $eq: ['$creatorId', _id] }]
                            },
                        }
                        },
                        { $project: { __v: 0 } }
                    ]
                    }
                },
            ])
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
            message: `Privacy`,
            data: {
                user
            }
        }
	},

    async updatePrivacy(ctx){
		const { 
            request: { 
                body
            },
            state: {
                user: {
                    _id
                },
                id
            }
        } = ctx

        let privacy = nullW

        const data = pick(body, Privacy.createFields);

		try{
            privacy = await Privacy.findOneAndUpdate({ _id: id, creatorId: _id }, { $set: data }, { new: true }).select({ __v: 0, deletedAt: 0 })

            if(!privacy){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Privacy with id=${id} does not belong to user with id=${_id}`,
                    data: null
                };
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
            message: `Privacy updated`,
            data: {
                privacy
            }
        }
	},

    async updateAccountType(ctx){
		const { 
            state: {
                user: {
                    _id
                }
            }
        } = ctx

        let user = null

        // To Do: Account type logic

		try{
            user = await User.aggregate([
                { $match: { _id, active: true, deletedAt: { $eq: null }  } },
                { $project: { __v: 0 } },
                {
                    $lookup: {
                    from: 'privacies',
                    as: 'privacy',
                    pipeline: [
                        {
                        $match: {
                            $expr: {
                            $and: [{ $eq: ['$creatorId', _id] }]
                            },
                        }
                        },
                        { $project: { __v: 0 } }
                    ]
                    }
                },
            ])
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
            message: `Account type updated`,
            data: {
                user
            }
        }
	},

};