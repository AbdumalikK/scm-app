import { Post } from '../../post/models'
import { User } from '../../user/models'

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
    const paginationMetaData = {}

    const startIndex = page === 1 ? 0 : (page - 1) * limit;
    const endIndex = page * limit;
    paginationMetaData.page = page
    paginationMetaData.limit = limit

    if (startIndex > 0){
      paginationMetaData.prevPage = page - 1
      paginationMetaData.hasPrevPage = true
    }

    let posts = null

    switch(type){
      case 1: {
        const total = await Post.countDocuments({ tags: { $regex: search, $options: 'i' }, active: true, deletedAt: { $eq: null }  }).exec()
        paginationMetaData.totalPages = Math.ceil(total / limit)
        paginationMetaData.total = total

        if (endIndex < total) {
          paginationMetaData.nextPage = page + 1
          paginationMetaData.hasNextPage = true
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
              message: `Internal error`,
              data: null
          };
        }
        break
      }
      case 2: {
        const total = await User.countDocuments({ username: { $regex: search, $options: 'i' }, active: true, deletedAt: { $eq: null }  }).exec()
        paginationMetaData.totalPages = Math.ceil(total / limit)
        paginationMetaData.total = total

        if (endIndex < total) {
          paginationMetaData.nextPage = page + 1
          paginationMetaData.hasNextPage = true
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
              message: `Internal error`,
              data: null
          };
        }
        break
      }
      default: {
        ctx.status = 400
        return ctx.body = {
            success: false,
            message: `Invalid value of type`,
            data: null
        };
      }
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
};