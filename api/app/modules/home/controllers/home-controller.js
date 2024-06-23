import { Follower, Following } from '../../follow/models'

import logger from '../../../utils/logs/logger'
import { UserHistory } from '../../story/models';
import { Post } from '../../post/models';
import mongoose from 'mongoose';


export default {
    async getStories(ctx){
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
            const followings = await Follower
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

        const page = parseInt(query.page) || 1
        const limit = parseInt(query.limit) || 30
        const paginationMetaData = {}

        const total = await Post.aggregate([
            { $unwind: '$like' },
            { $group: { _id: '$_id', like: { $push: '$like' }, size: { $sum:1 } } },
            { $sort: { 'size': -1 } }
        ]).exec()
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
        
        let feed = [], posts = []

		try{
            const followings = await Following.find({ creatorId: _id, active: true, deletedAt: { $eq: null } })

            if(!followings.length){
                posts = await Post.aggregate([
                    { $unwind: '$like' },
                    { $group: { _id: '$_id', like: { $push: '$like' }, size: { $sum:1 } } },
                    { $sort: { 'size': -1 } },
                    { $limit: limit }
                ])

                for(let i = 0; i < posts.length; i++) 
                    feed.push(await Post.findById(posts[i]._id).select({ __v: 0 }))
            }else{
                skip = 0
                for(let i = 0; i < followings.length; i++){
                    if([3, 6].indexOf(i) > -1){
                        let likedPost = await LikedPost(++skip)
                        if(feed.includes(likedPost))
                            likedPost = await LikedPost(++skip)

                        if(likedPost.length){
                            const ads = await Post.aggregate([
                                { $match: { tags: likedPost[0].tags, active: true, deletedAt: { $eq: null } } },
                                { $limit : 1 },
                                { $project: { __v: 0 } },

                                // to do: get creatorId from rndom post
                                // { 
                                //     $lookup: {
                                //         from: 'users',
                                //         as: 'users',
                                //         pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$_id',  ] }] }}}, { $project: { __v: 0, password: 0, deletedAt: 0 } }]
                                //     }
                                // },  
                            ]) // ads
                            
                            if(ads.length)
                                feed.push(ads[0]) // ads
                        }else
                            await PostFromFollowingUser(feed) // post from following user
                        
                    }else{
                        posts = await Post.aggregate([
                            { $match: { creatorId: followings[i].userId, active: true, deletedAt: { $eq: null } } },
                            { $limit : 1 },
                            { $sort : { createdAt: -1 } },
                            { $project: { __v: 0 } },
                            { 
                                $lookup: {
                                    from: 'users',
                                    as: 'users',
                                    pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$_id', followings[i].userId ] }] }}}, { $project: { __v: 0, password: 0, deletedAt: 0 } }]
                                }
                            },
                        ])

                        feed.push(posts[0])
                    }

                    if(limit === i+1)
                        break
                }
            }

            async function LikedPost(skip){
                return Post.find({ like: { $elemMatch: { creatorId: _id, active: true, deletedAt: { $eq: null } } } }).sort({ createdAt: -1 }).skip(skip)
            }

            async function PostFromFollowingUser(feed){
                feed.push(await Post.findOne({ creatorId: followings[i].creatorId }).select({ __v: 0 }))
                return feed.sort((p,c) => p.createdAt < c.createdAt)
            }
		}catch(ex){
			logger.error(`----- Error. ${ex.status}: ${ex.message} -----`)
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `Internal error: ${ex.message}`
			};
		}
		
        return ctx.body = {
            success: true,
            message: `Feeds`,
            data: {
                feed
            },
        }
	}
};