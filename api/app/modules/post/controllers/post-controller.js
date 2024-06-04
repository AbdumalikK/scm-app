import pick from 'lodash/pick'

import { User } from '../../user/models'
import { Post } from '../models'

import logger from '../../../utils/logs/logger'
import { Wallet } from '../../wallet/models';
import { Currency } from '../../currency/models';
import { InternalTransaction } from '../../internal-transaction/models';
import { SOM } from '../../internal-transaction/constants';
import { UnlockedPost } from '../../unlocked-post/models';
import { PostViewer } from '../../post-viewer/models';
import { TargetAudience } from '../../target-audience/models';
import { Boost } from '../../boost/models';
import { SystemWallet } from '../../system-wallet/models';


export default {
    // reels
    async getReels(ctx){
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

        let reels = null

        const page = parseInt(query.page) || 1
        const limit = parseInt(query.limit) || 30
        const paginationMetaData = {}

        const total = await Post.countDocuments({ creatorId: _id, reels: true, active: true, deletedAt: { $eq: null } }).exec()
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

		try{
            reels = await Post
                .find({ creatorId: _id, reels: true,  active: true, deletedAt: { $eq: null } })
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
            message: `Reels`,
            data: {
                reels
            },
            paginationMetaData
        }
	},

    async getReelsByUserId(ctx){
		const { 
            request: {
                query
            },
            state: {
                user: {
                    _id
                },
                userId
            }
        } = ctx
        
        let reels = []

        const page = parseInt(query.page) || 1
        const limit = parseInt(query.limit) || 30
        const paginationMetaData = {}

        const total = await Post.countDocuments({ creatorId: userId, reels: true, active: true, deletedAt: { $eq: null } }).exec()
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

		try{
            reels = await Post
                .find({ creatorId: userId, reels: true,  active: true, deletedAt: { $eq: null } })
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
            message: `Reels`,
            data: {
                reels
            },
            paginationMetaData
        }
	},



    // tv
    async getTvs(ctx){
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

        let tvs = null

        const page = parseInt(query.page) || 1
        const limit = parseInt(query.limit) || 30
        const paginationMetaData = {}

        const total = await Post.countDocuments({ creatorId: _id, tv: true, active: true, deletedAt: { $eq: null } }).exec()
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

		try{
            tvs = await Post
                .find({ creatorId: _id, tv: true,  active: true, deletedAt: { $eq: null } })
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
            message: `Tvs`,
            data: {
                tvs
            },
            paginationMetaData
        }
	},

    async getTvsByUserId(ctx){
		const { 
            request: {
                query
            },
            state: {
                user: {
                    _id
                },
                userId
            }
        } = ctx
        
        let tvs = []

        const page = parseInt(query.page) || 1
        const limit = parseInt(query.limit) || 30
        const paginationMetaData = {}

        const total = await Post.countDocuments({ creatorId: userId, tv: true, active: true, deletedAt: { $eq: null } }).exec()
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

		try{
            const userTvs = await Post
                .find({ creatorId: userId, tv: true,  active: true, deletedAt: { $eq: null } })
                .select({ __v: 0 })
                .sort({ createdAt: -1 })
                .skip(startIndex)
                .limit(limit)

            if(userTvs.length){
                for(let i = 0; i < userTvs.length; i++){
                    const unlockedPost = await UnlockedPost.findOne({ creatorId: _id, postId: userTvs[i]._id })

                    tvs.push({ ...userTvs[i]._doc, unlocked: unlockedPost ? true : false }) 
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
            message: `Tvs`,
            data: {
                tvs
            },
            paginationMetaData
        }
	},


    // post
    async getPost(ctx){
		const { 
            state: {
                postId
            }
        } = ctx

        let post = null

		try{
            post = await Post.findById(postId).select({ __v: 0, active: 0, deletedAt: 0 })
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
            message: `Post`,
            data: {
                post
            }
        }
	},


    async getPostsByUserId(ctx){
		const { 
            request: {
                query
            },
            state: {
                user: {
                    _id
                },
                userId
            }
        } = ctx


        let posts = null

        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 30;
        const paginationMetaData = {}

        const select = {
            __v: 0,
            deletedAt: 0,
            active: 0
        }

        const total = await Post.countDocuments({ 
            creatorId: userId,
            audience: { $exists: true, $eq: [] },
            active: true, 
            deletedAt: { $eq: null }
        }).exec()
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

		try{
            posts = await Post
                .find({ creatorId: userId, audience: { $exists: true, $eq: [] }, active: true, deletedAt: { $eq: null } })
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
            message: `Posts`,
            data: {
                posts
            },
            paginationMetaData
        }
	},


    async getPosts(ctx){
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


        let posts = null

        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 30;
        const paginationMetaData = {}

        const select = {
            __v: 0,
            deletedAt: 0,
            active: 0
        }

        const total = await Post.countDocuments({ active: true, deletedAt: { $eq: null } }).exec()
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

		try{
            posts = await Post
                .find({ active: true, deletedAt: { $eq: null } })
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
            message: `Posts`,
            data: {
                posts
            },
            paginationMetaData
        }
	},


    async addPost(ctx){
		const { 
            request: { 
                body
            },
            state: {
                user: {
                    _id
                }
            }
        } = ctx


        const data = pick(body, Post.createFields);

        let post = null

		try{
            const user = await User.findById(_id)

            if(data.tv && !user.creator){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `User can not post tv`,
                    data: null
                }
            }

            post = await Post.create({ creatorId: _id, ...data })
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
            message: `Post added`,
            data: {
                post
            }
        }
	},

    async updatePost(ctx){
		const { 
            request: { 
                body
            },
            state: {
                user: {
                    _id
                },
                postId
            }
        } = ctx
    
        const data = pick(body, Post.createFields);

		let post = {}

		try{
			post = await Post.findOneAndUpdate({ _id: postId, creatorId: _id }, { $set: data }).select({ 
                __v: 0,
                acive: 0,
                deletedAt: 0
            })

            if(!post){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Post with id=${_id} & creatorId=${_id} not found`,
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
            message: `Post updated`,
            data: {
                post
            }
        }
	},

    async deletePost(ctx){
		const { 
            state: {
                postId
            }
        } = ctx

		try{
            await Post.findByIdAndUpdate(postId, { $set: { deletedAt: new Date(), active: false } })            
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
            message: 'Post successfully deleted',
            data: {
                postId
            }
        }
	},


    async addViewer(ctx){
		const {
            state: {
                user: {
                    _id
                },
                postId
            }
        } = ctx

        let post = null

		try{
            post = await Post.findOne({ _id: postId, active: true, deletedAt: { $eq: null } })

            if(!post){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Post with id=${id} not found`,
                    data: null
                }
            }

            // post = await Post.findByIdAndUpdate(postId, { $inc: { countViewers: 1 } }, { new: true })

            // save viewer
            await PostViewer.create({ creatorId: _id, postId })
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
            message: `Viewer added`,
            data: {
                post
            }
        }
	},


    async addPostComment(ctx){
		const { 
            request: { 
                body: {
                    payload = null
                }
            },
            state: {
                user: {
                    _id
                },
                postId
            }
        } = ctx

        if(!payload){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `Payload not passed`,
                data: null
            };
        }

        const comment = {
            creatorId: _id,
            createdAt: new Date(),
            payload
        }

		let post = {}

		try{
			post = await Post.findOneAndUpdate({ _id: postId, creatorId: _id }, { $push: { comment } }, { new: true }).select({ __v: 0 })

            if(!post){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Post with id=${_id} & creatorId=${_id} not found`,
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
            message: `Post comment added`,
            data: {
                post
            }
        }
	},

    async updatePostComment(ctx){
		const { 
            request: { 
                body: {
                    payload = null
                }
            },
            state: {
                user: {
                    _id
                },
                postId,
                commentId
            }
        } = ctx

        if(!payload){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `Payload not passed`,
                data: null
            };
        }

		let post = {}

		try{
			post = await Post.findOneAndUpdate({ _id: postId, creatorId: _id, 'comment._id': commentId }, { $set: { 'comment.$.payload': payload } }, { new: true }).select({ __v: 0 })

            if(!post){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Post with id=${_id} & creatorId=${_id} & commentId=${commentId} not found`,
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
            message: `Post comment updated`,
            data: {
                post
            }
        }
	},

    async deletePostComment(ctx){
		const {
            state: {
                user: {
                    _id
                },
                postId,
                commentId
            }
        } = ctx

		let post = {}

		try{
			post = await Post.findOneAndUpdate(
                { 
                    _id: postId, 
                    creatorId: _id, 
                    'comment._id': commentId 
                }, 
                { 
                    $set: { 
                        'comment.$.active': false, 
                        'comment.$.deletedAt': new Date() 
                    } 
                }, 
                { new: true }
            ).select({ __v: 0 })

            if(!post){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Post with id=${postId} & creatorId=${_id} & commentId=${commentId} not found`,
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
            message: `Post comment deleted`,
            data: {
                post
            }
        }
	},


    async addPostCommentLike(ctx){
		const {
            state: {
                user: {
                    _id
                },
                postId,
                commentId
            }
        } = ctx

		let post = {}

        const data = {
            creatorId: _id,
            createdAt: new Date()
        }

		try{
            post = await Post.findOne({
                _id: postId, 
                creatorId: _id,
                comment: {
                    $elemMatch: {
                        _id: commentId,
                        like: {
                            $elemMatch: {
                                creatorId: _id
                            }
                        }
                    }
                }
            })

            if(post){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Like already exists`,
                    data: null
                };
            }

			post = await Post.findOneAndUpdate({ _id: postId, creatorId: _id, 'comment._id': commentId }, { $push: { 'comment.$.like': data } }, { new: true }).select({ __v: 0 })

            if(!post){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Post with id=${_id} & creatorId=${_id} & commentId=${commentId} not found`,
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
            message: `Post comment like added`,
            data: {
                post
            }
        }
	},

    async deletePostCommentLike(ctx){
		const {
            state: {
                user: {
                    _id
                },
                postId,
                commentId,
                likeId
            }
        } = ctx

		let post = {}

		try{
			post = await Post.findOneAndUpdate(
                {
                    _id: postId, 
                    creatorId: _id,
                    comment: {
                        $elemMatch: {
                            _id: commentId,
                            like: {
                                $elemMatch: {
                                    _id: likeId
                                }
                            }
                        }
                    }
                },
                {
                    $set: { 
                        'comment.$[i].like.$[j].active': false,
                        'comment.$[i].like.$[j].deletedAt': new Date()
                    }
                },
                {
                    arrayFilters: [
                        {
                            'i._id': commentId
                        }, 
                        {
                            'j._id': likeId
                        }
                    ],
                    new: true
                }
            ).select({ __v: 0 })

            if(!post){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Post with id=${_id} & creatorId=${_id} & commentId=${commentId} not found`,
                    data: null
                };
            }
		}catch(ex){
			logger.error(`Error. ${ex.status} ${ex.message}`)
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Internal error`,
                data: null
			};
		}
		
        return ctx.body = {
            success: true,
            message: `Post comment like deleted`,
            data: {
                post
            }
        }
	},

    async addPostCommentReply(ctx){
		const { 
            request: { 
                body: {
                    payload = null
                }
            },
            state: {
                user: {
                    _id
                },
                postId,
                commentId
            }
        } = ctx

        if(!payload){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `Payload not passed`,
                data: null
            };
        }

        const reply = {
            creatorId: _id,
            createdAt: new Date(),
            payload
        }

		let post = {}

		try{
			post = await Post.findOneAndUpdate(
                { 
                    _id: postId, 
                    creatorId: _id,
                    comment: {
                        $elemMatch: {
                            _id: commentId
                        }
                    }
                },
                { 
                    $push: { 
                        'comment.$[i].reply': reply,
                    }
                },
                {
                    arrayFilters: [
                        {
                            'i._id': commentId
                        }
                    ],
                    new: true
                }
            ).select({ __v: 0 })

            if(!post){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Post with id=${_id} & creatorId=${_id} & commentId=${commentId} not found`,
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
            message: `Post comment reply added`,
            data: {
                post
            }
        }
	},

    async updatePostCommentReply(ctx){
		const { 
            request: { 
                body: {
                    payload = null
                }
            },
            state: {
                user: {
                    _id
                },
                postId,
                commentId,
                replyId
            }
        } = ctx

        if(!payload){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `Payload not passed`,
                data: null
            };
        }

		let post = {}

		try{
			post = await Post.findOneAndUpdate(
                { 
                    _id: postId, 
                    creatorId: _id,
                    comment: {
                        $elemMatch: {
                            _id: commentId
                        }
                    }
                }, 
                { 
                    $set: { 
                        'comment.$[i].reply.$[j].payload': payload,
                    }
                }, 
                { 
                    arrayFilters: [
                        {
                            'i._id': commentId
                        }, 
                        {
                            'j._id': replyId
                        }
                    ],
                    new: true 
                }
            ).select({ __v: 0 })

            if(!post){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Post with id=${_id} & creatorId=${_id} & commentId=${commentId} & replyId=${replyId} not found`,
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
            message: `Post comment reply updated`,
            data: {
                post
            }
        }
	},

    async deletePostCommentReply(ctx){
		const {
            state: {
                user: {
                    _id
                },
                postId,
                commentId,
                replyId
            }
        } = ctx

		let post = {}

		try{
			post = await Post.findOneAndUpdate(
                { 
                    _id: postId, 
                    creatorId: _id,
                    comment: {
                        $elemMatch: {
                            _id: commentId,
                            reply: {
                                $elemMatch: {
                                    _id: replyId
                                }
                            }
                        }
                    }
                }, 
                { 
                    $set: { 
                        'comment.$[i].reply.$[j].active': false,
                        'comment.$[i].reply.$[j].deletedAt': new Date(),
                    }
                }, 
                { 
                    arrayFilters: [
                        {
                            'i._id': commentId
                        }, 
                        {
                            'j._id': replyId
                        }
                    ],
                    new: true 
                }
            ).select({ __v: 0 })

            if(!post){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Post with id=${postId} & creatorId=${_id} & commentId=${commentId} & replyId=${replyId} not found`,
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
            message: `Post comment reply deleted`,
            data: {
                post
            }
        }
	},


    async addPostCommentReplyLike(ctx){
		const {
            state: {
                user: {
                    _id
                },
                postId,
                commentId,
                replyId
            }
        } = ctx

		let post = {}

        const data = {
            creatorId: _id,
            createdAt: new Date()
        }

		try{
            post = await Post.findOne({
                _id: postId, 
                creatorId: _id,
                comment: {
                    $elemMatch: {
                        _id: commentId,
                        reply: {
                            $elemMatch: {
                                _id: replyId,
                                like: {
                                    $elemMatch: {
                                        creatorId: _id
                                    }
                                }
                            }
                        }
                    }
                }
            })

            if(post){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Like already exists`,
                    data: null
                };
            }

			post = await Post.findOneAndUpdate(
                { 
                    _id: postId, 
                    creatorId: _id, 
                    'comment._id': commentId 
                }, 
                { 
                    $push: { 
                        'comment.$[i].reply.$[j].like': data 
                    } 
                }, 
                { 
                    arrayFilters: [
                        {
                            'i._id': commentId
                        }, 
                        {
                            'j._id': replyId
                        }
                    ],
                    new: true 
                }
            ).select({ __v: 0 })

            if(!post){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Post with id=${_id} & creatorId=${_id} & commentId=${commentId} not found`,
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
            message: `Post comment reply like added`,
            data: {
                post
            }
        }
	},

    async deletePostCommentReplyLike(ctx){
		const {
            state: {
                user: {
                    _id
                },
                postId,
                commentId,
                replyId,
                replyLikeId
            }
        } = ctx

		let post = {}

		try{
			post = await Post.findOneAndUpdate(
                { 
                    _id: postId,
                    creatorId: _id,
                    comment: {
                        $elemMatch: {
                            _id: commentId,
                            reply: {
                                $elemMatch: {
                                    _id: replyId,
                                    like: {
                                        $elemMatch: {
                                            _id: replyLikeId
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    $set: {
                        'comment.$[i].reply.$[j].like.$[k].active': false,
                        'comment.$[i].reply.$[j].like.$[k].deletedAt': new Date()
                    }
                },
                {
                    arrayFilters: [
                        {
                            'i._id': commentId
                        }, 
                        {
                            'j._id': replyId
                        },
                        {
                            'k._id': replyLikeId
                        }
                    ],
                    new: true
                }
            ).select({ __v: 0 })

            if(!post){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Post with id=${_id} & creatorId=${_id} & commentId=${commentId} & replyId=${replyId} not found`,
                    data: null
                };
            }
		}catch(ex){
			logger.error(`Error. ${ex.status} ${ex.message}`)
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Internal error`,
                data: null
			};
		}
		
        return ctx.body = {
            success: true,
            message: `Post comment reply like deleted`,
            data: {
                post
            }
        }
	},


    async unlockPost(ctx){
		const { 
            request: { 
                body: {
                    postId = null
                }
            },
            state: {
                user: {
                    _id
                }
            }
        } = ctx

        if(!postId){
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `PostId not passed`,
                data: null
            }
        }

        let post = null

		try{
            post = await Post.findOne({ _id: postId, active: true, deletedAt: { $eq: null } })

            if(!post){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Post with id=${postId} not found`,
                    dta: null
                }
            }

            if(post.price === 0){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `User can not buy post. Post free`,
                    data: null
                }
            }

            let senderWallet = await Wallet.findOne({ creatorId: _id, active: true, deletedAt: { $eq: null } })
            
            if(!senderWallet){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Sender wallet not found`,
                    data: null
                }
            }

            if(senderWallet.coin < post.price){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `User does not have enough coin`
                }
            }

            let recipientWallet = await Wallet.findOne({ creatorId: post.creatorId, active: true, deletedAt: { $eq: null } })

            if(!recipientWallet){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Recipient wallet not found`
                }
            }

            // update sender wallet
            senderWallet.coin += -post.price

            // update recipoient wallet
            recipientWallet.coin += post.price

            const currency = await Currency.find()

            if(!currency.length){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Currency not found`,
                    data: null
                }
            }

            const amount = post.price * currency[0].exchangeRate

            await InternalTransaction.create({
                creatorId: _id,
                senderId: _id,
                senderWalletId: senderWallet._id,
                recipientId: post.creatorId,
                recipientWalletId: recipientWallet._id,
                coin: post.price,
                exchangeRate: currency[0].exhcangeRate,
                currency: SOM,
                amount,
                p2tv: true
            })

            // save calculated coin
            await senderWallet.save()
            await recipientWallet.save()

            // create unlocked post
            await UnlockedPost.create({ creatorId: _id, userId: _id, postId: post._id  })
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
            message: `Post unlocked`,
            data: {
                post
            }
        }
	},


    async boost(ctx){
		const { 
            request: { 
                body
            },
            state: {
                user: {
                    _id
                },
                postId
            }
        } = ctx

        const boostData = pick(body, Boost.createFields)

        let post = null, boost = null

		try{
            let wallet = await Wallet.findOne({ creatorId: _id, active: true, deletedAt: { $eq: null } })
            
            if(!wallet){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Wallet not found`,
                    data: null
                }
            }

            const total = boostData.budget * boostData.duration

            if(wallet.coin < total){
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `User does not have enough money`,
                    data: null
                }                                                                                                                                                            
            }

            wallet.coin = wallet.coin - total

            boost = await Boost.create({ creatorId: _id, postId, ...boostData })

            if(body['targetAudienceOwn']){
                const targetAudienceData = pick(body.targetAudienceOwn, TargetAudience.createFields)
                
                let targetAudience = await TargetAudience.findOne({ createdId: _id, postId, ...targetAudienceData, active: true, deletedAt: { $eq: null } })

                if(!targetAudience){
                    targetAudience = await TargetAudience.create({ creatorId: _id, postId, ...targetAudienceData })
                }

                boost = await Boost.findByIdAndUpdate(boost._id, { $set: { targetAudienceOwnId: targetAudience._id } }, { new: true })
            }

            post = await Post.findOne({ _id: postId, creatorId: _id })

            // save calculated coins
            await wallet.save()

            // save coins to system wallet
            await SystemWallet.findOneAndUpdate({ name: 'system', active: true, deletedAt: { $eq: null } }, { $inc: { coin: total } }, { new: true })
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
            message: `Post boosted`,
            data: {
                post,
                boost
            }
        }
	},

    // insights
    async getInsights(ctx){
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

        let insights = null
        
		try{
            const reels = await Post
                .find({ creatorId: _id, reels: true,  active: true, deletedAt: { $eq: null } })
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
            message: `Insights`,
            data: {
                insights
            }
        }
	},
};