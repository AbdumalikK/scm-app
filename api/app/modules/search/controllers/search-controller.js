import pick from 'lodash/pick'

import { Post } from '../../post/models'
import { User } from '../../user/models'

import logger from '../../../utils/logs/logger'


export default {
    async search(ctx){
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

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 30;
    const search = query.search
    const type = +query.type
    const result = {};

    let posts = null

    switch(type){
      case 1: {
        const startIndex = page === 1 ? 0 : (page - 1) * limit;
        const endIndex = page * limit;
        result.totalPosts = await Post.countDocuments({ tags: { $regex: search, $options: 'i' }, active: true, deletedAt: { $eq: null }  }).exec()


        if (startIndex > 0) {
            result.previous = {
                page: page - 1,
                limit: limit
            };
        }
        if (endIndex < await Post.countDocuments({ tags: { $regex: search, $options: 'i' }, active: true, deletedAt: { $eq: null }  }).exec()) {
            result.next = {
                page: page + 1,
                limit: limit
            };
        }

        try{
            posts = await Post.find({ tags: { $regex: search, $options: 'i' }, active: true, deletedAt: { $eq: null }  })
              .select({ __v: 0, deletedAt: 0 })
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
        break
      }
      case 2: {
        const startIndex = page === 1 ? 0 : (page - 1) * limit;
        const endIndex = page * limit;
        result.totalPosts = await User.countDocuments({ username: { $regex: search, $options: 'i' }, active: true, deletedAt: { $eq: null }  }).exec()


        if (startIndex > 0) {
            result.previous = {
                page: page - 1,
                limit: limit
            };
        }
        if (endIndex < await User.countDocuments({ username: { $regex: search, $options: 'i' }, active: true, deletedAt: { $eq: null }  }).exec()) {
            result.next = {
                page: page + 1,
                limit: limit
            };
        }

        try{
            posts = await User.find({ username: { $regex: search, $options: 'i' }, active: true, deletedAt: { $eq: null }  })
              .select({ __v: 0, deletedAt: 0 })
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
        break
      }
      default: {
        ctx.status = 400
        return ctx.body = {
            success: false,
            message: `Invalid value of type`
        };
      }
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