import { User } from '../../user/models'
import { Privacy } from '../../privacy/models'
import { Post } from '../../post/models'

export default {
    async getArchives(ctx){
		const { 
            state: {
                user: {
                    _id
                }
            }
        } = ctx

        let archives = null

		try{
            archives = await Post.find({ creatorId: _id, active: false, deletedAt: { $eq: null } })
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
                archives
            }
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
				message: `Internal error`
			};
		}
		
        return ctx.body = {
            success: true,
            message: {
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
                    message: `Privacy with id=${id} does not belong to user with id=${_id}`
                };
            }
		}catch(ex){
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `${ex.message}`
			};
		}
		
        return ctx.body = {
            success: true,
            message: {
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
				message: `Internal error`
			};
		}
		
        return ctx.body = {
            success: true,
            message: {
                user
            }
        }
	},

};