import { Post } from '../../post/models'

import logger from '../../../utils/logs/logger'


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
        const result = {}

        const select = {
            __v: 0,
            deletedAt: 0,
            active: 0
        }


        let posts = null

        const totalPosts = await Post.countDocuments({ creatorId: _id, active: false, deletedAt: { $eq: null } }).exec();
        const startIndex = page === 1 ? 0 : (page - 1) * limit;
        const endIndex = page * limit
        result.totalPosts = totalPosts;

        if (startIndex > 0) {
            result.previous = {
                page: page - 1,
                limit: limit
            };
        }
        if (endIndex < (await Post.countDocuments({ creatorId: _id, active: false, deletedAt: { $eq: null } }).exec())) {
            result.next = {
                page: page + 1,
                limit: limit
            };
        }

		try{
            posts = await Post
                .find({ creatorId: _id, active: false, deletedAt: { $eq: null } })
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
                posts,
                pagination: result
            }
        }
	},
};