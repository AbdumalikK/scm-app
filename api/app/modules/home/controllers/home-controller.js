import { Follow } from '../../follow/models'

import logger from '../../../utils/logs/logger'
import { UserHistory } from '../../story/models';


export default {
    async getHistories(ctx){
		const { 
            request: {
                query: {
                    
                }
            },
            state: {
                user: {
                    _id
                }
            }
        } = ctx


        let stories = {}

        const select = {
            __v: 0,
            deletedAt: 0,
            active: 0
        };

		try{
            const followings = await Follow
                .find({ creator_id: _id, active: true, deletedAt: { $eq: null } })
                .select(select)
                .sort({ createdAt: -1 })


            // const recommendations = await UserFollow
            for(let i = 0; i < followings.length; i++){
                if(i % 4 === 0){
                    
                }else{
                    const userHistory = await UserHistory.findMany({
                        creatorId: followings[i].userId,
                        active: true,
                        deletedAt: { $eq: null }
                    })
    
                    stories[`${followings[i].userUsername}`] = userHistory    
                }
            }
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
                stories,
                pagination: result
            }
        }
	},

    async getFeeds(ctx){
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


        let follows = null

        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const sort = query.sort
        const result = {};

        const select = {
            __v: 0,
            deletedAt: 0,
            active: 0
        };

        const totalPosts = await Follow.countDocuments({ active: true }).exec();
        const startIndex = page === 1 ? 0 : (page - 1) * limit;
        const endIndex = page * limit;
        result.totalPosts = totalPosts;

        if (startIndex > 0) {
            result.previous = {
                page: page - 1,
                limit: limit
            };
        }
        
        if (endIndex < (await Follow.countDocuments({ active: true }).exec())) {
            result.next = {
                page: page + 1,
                limit: limit
            };
        }

		// try{
        //     feed = await UserFollow
        //         .find({ creator_id: _id, active: true, deletedAt: { $eq: null } })
        //         .select(select)
        //         .sort({ createdAt: -1 })
        //         .skip(startIndex)
        //         .limit(limit)
		// }catch(ex){
		// 	logger.error(`----- Error. ${ex.status}: ${ex.message} -----`)
		// 	ctx.status = 500
		// 	return ctx.body = {
		// 		success: false,
		// 		message: `Internal error`
		// 	};
		// }
		
        return ctx.body = {
            success: true,
            message: `Feeds`,
            data: {
                follows,
                pagination: result
            },
        }
	}
};