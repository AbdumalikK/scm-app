import pick from 'lodash/pick'

import { User } from '../../user/models'
import { Post } from '../models'

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
                body: {
                    mediaUri,
                    comment,
                    tags
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
            post = await Post.create({ 
                mediaUri,
                creatorId: _id,
                comment,
                tags
            })
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
};