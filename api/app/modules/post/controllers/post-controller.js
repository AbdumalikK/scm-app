import pick from 'lodash/pick'

import { User } from '../../user/models'
import { UserPost } from '../models'

import logger from '../../../utils/logs/logger'


export default {
    async getPost(ctx){
		const { 
            state: {
                postId
            }
        } = ctx

        let post = null

		try{
            post = await UserPost.findById(postId).select({ __v: 0, active: 0, deletedAt: 0 })
		}catch(ex){
			logger.error(`----- Error. ${ex.status}: ${ex.message} -----`)
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `Internal error`
			};
		}
		
        return ctx.body = {
            success: true,
            message: {
                post
            }
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
        const sort = query.sort
        const result = {};

        const select = {
            __v: 0,
            deletedAt: 0,
            active: 0
        };

        const totalPosts = await UserPost.countDocuments({ active: true, deletedAt: { $eq: null } }).exec();
        const startIndex = page === 1 ? 0 : (page - 1) * limit;
        const endIndex = page * limit;
        result.totalPosts = totalPosts;

        if (startIndex > 0) {
            result.previous = {
                page: page - 1,
                limit: limit
            };
        }
        if (endIndex < (await UserPost.countDocuments({ active: true, deletedAt: { $eq: null } }).exec())) {
            result.next = {
                page: page + 1,
                limit: limit
            };
        }

		try{
            posts = await UserPost
                .find({ active: true, deletedAt: { $eq: null } })
                .select(select)
                .sort({ createdAt: -1 })
                .skip(startIndex)
                .limit(limit)
		}catch(ex){
			logger.error(`----- Error. ${ex.status}: ${ex.message} -----`)
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


    async addPost(ctx){
		const { 
            request: { 
                body: {
                    mediaUri,
                    comment
                }
            },
            state: {
                user: {
                    _id
                }
            }
        } = ctx

        let post = null

		try{
            const user = await User.findById(_id)

            if(!user){
                logger.error(`Error. User with id=${_id} not found`)
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `User with id=${_id} not found`
                };
            }

            post = await UserPost.create({ 
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                avaUri: user.avaUri,
                mediaUri,
                creatorId: user._id,
                comment,
            })
		}catch(ex){
			logger.error(`----- Error. ${ex.status}: ${ex.message} -----`)
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `${ex.message}`
			};
		}
		
        return ctx.body = {
            success: true,
            message: {
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
    
        const data = pick(body, UserPost.createFields);

		let post = {}

		try{
			post = await UserPost.findOneAndUpdate({ _id: postId, creatorId: _id }, { $set: data }).select({ 
                __v: 0,
                acive: 0,
                deletedAt: 0
            })

            if(!post){
                logger.error(`Error. Post with id=${_id} & creatorId=${_id} not found`)
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Post with id=${_id} & creatorId=${_id} not found`
                };
            }
		}catch(ex){
			logger.error(`Error. ${ex.status} ${ex.message}`)
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Internal error`
			};
		}
		
        return ctx.body = {
            success: true,
            message: {
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
            await UserPost.findByIdAndUpdate(postId, { $set: { deletedAt: new Date(), active: false } })            
		}catch(ex){
			logger.error(`----- Error. ${ex.status}: ${ex.message} -----`)
			ctx.status = 500
			return ctx.body = {
				success: false,
				message: `Internal error`
			};
		}
		
        return ctx.body = {
            success: true,
            message: 'Post successfully deleted'
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
            logger.error(`Error. Payload not passed`)
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `Payload not passed`
            };
        }

        const comment = {
            creatorId: _id,
            createdAt: new Date(),
            payload
        }

		let post = {}

		try{
			post = await UserPost.findOneAndUpdate({ _id: postId, creatorId: _id }, { $push: { comment } }, { new: true }).select({ __v: 0 })

            if(!post){
                logger.error(`Error. Post with id=${_id} & creatorId=${_id} not found`)
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Post with id=${_id} & creatorId=${_id} not found`
                };
            }
		}catch(ex){
			logger.error(`Error. ${ex.status} ${ex.message}`)
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Internal error`
			};
		}
		
        return ctx.body = {
            success: true,
            message: {
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
            logger.error(`Error. Payload not passed`)
            ctx.status = 400
            return ctx.body = {
                success: false,
                message: `Payload not passed`
            };
        }

		let post = {}

		try{
			post = await UserPost.findOneAndUpdate({ _id: postId, creatorId: _id, 'comment._id': commentId }, { $set: { 'comment.$.payload': payload } }, { new: true }).select({ __v: 0 })

            if(!post){
                logger.error(`Error. Post with id=${_id} & creatorId=${_id} & commentId=${commentId} not found`)
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Post with id=${_id} & creatorId=${_id} & commentId=${commentId} not found`
                };
            }
		}catch(ex){
			logger.error(`Error. ${ex.status} ${ex.message}`)
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Internal error`
			};
		}
		
        return ctx.body = {
            success: true,
            message: {
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
			post = await UserPost.findOneAndUpdate(
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
                logger.error(`Error. Post with id=${_id} & creatorId=${_id} & commentId=${commentId} not found`)
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Post with id=${_id} & creatorId=${_id} & commentId=${commentId} not found`
                };
            }
		}catch(ex){
			logger.error(`Error. ${ex.status} ${ex.message}`)
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Internal error`
			};
		}
		
        return ctx.body = {
            success: true,
            message: {
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
            post = await UserPost.findOne({
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
                logger.error(`Error. Like already exists`)
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Like already exists`
                };
            }

			post = await UserPost.findOneAndUpdate({ _id: postId, creatorId: _id, 'comment._id': commentId }, { $push: { 'comment.$.like': data } }, { new: true }).select({ __v: 0 })

            if(!post){
                logger.error(`Error. Post with id=${_id} & creatorId=${_id} & commentId=${commentId} not found`)
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Post with id=${_id} & creatorId=${_id} & commentId=${commentId} not found`
                };
            }
		}catch(ex){
			logger.error(`Error. ${ex.status} ${ex.message}`)
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Internal error`
			};
		}
		
        return ctx.body = {
            success: true,
            message: {
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
			post = await UserPost.findOneAndUpdate(
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
                logger.error(`Error. Post with id=${_id} & creatorId=${_id} & commentId=${commentId} not found`)
                ctx.status = 400
                return ctx.body = {
                    success: false,
                    message: `Post with id=${_id} & creatorId=${_id} & commentId=${commentId} not found`
                };
            }
		}catch(ex){
			logger.error(`Error. ${ex.status} ${ex.message}`)
			ctx.status = 400
			return ctx.body = {
				success: false,
				message: `Internal error`
			};
		}
		
        return ctx.body = {
            success: true,
            message: {
                post
            }
        }
	},
};