import { Following } from '../../follow/models';
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

  async explore(ctx){
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

    let posts = []

   
    const total = await Post.countDocuments({ tags: { $regex: search, $options: 'i' }, active: true, deletedAt: { $eq: null }  }).exec()
    paginationMetaData.totalPages = Math.ceil(total / limit)
    paginationMetaData.total = total

    if (endIndex < total) {
      paginationMetaData.nextPage = page + 1
      paginationMetaData.hasNextPage = true
    }

    try{
      // random liked post
      const likedPosts = await Post
        .aggregate([ 
          { 
            $match: { 
              like: { 
                $elemMatch: { 
                  creatorId: _id, 
                  active: true, 
                  deletedAt: { 
                    $eq: null 
                  } 
                } 
              },
              pictures: { $exists: true, $type: 'array', $ne: [] } 
            } 
          }, 
          { $sample: { size: 1 } } 
        ])
        .sort({ createdAt: -1 })
        .skip(startIndex)
        .limit(limit)
        .select({ __v: 0 })
        
      if(!likedPosts.length){
        // random following
        const randomFollowing = await Following
          .aggregate([ 
            { 
              $match: { 
                creatorId: _id, 
                active: true, 
                deletedAt: { 
                  $eq: null 
                },
              } 
            }, 
            { $sample: { size: 1 } },
            { 
              $lookup: {
                  from: 'users',
                  as: 'users',
                  localField: 'userId',
                  foreignField: '_id',
                  pipeline: [{ $match: { $expr: { $and: [{ $ne: ['$interests', [] ] }] }}}, { $project: { __v: 0, password: 0, deletedAt: 0 } }]
              }
          }, 
        ])
        
        if(!randomFollowing.length){
          // if liked post and following not exists then random posts
          posts = await Post
            .aggregate([
              { $match: { active: true, deletedAt: { $eq: null } } },
              { $limit: limit },
              { $sort: { createdAt: -1 } },
              { $project: { __v: 0 } },
              { 
                $lookup: {
                  from: 'users',
                  as: 'users',
                  localField: 'creatorId',
                  foreignField: '_id',
                  pipeline: [{ $project: { __v: 0, password: 0, deletedAt: 0 } }]
                }
              }
            ])
        }else{
          posts = await fetchPosts(randomFollowing[0].users.interests)
        }
      }else{
        posts = await fetchPosts(likedPosts[i].tags)
      }


      async function fetchPosts(tags){
        return Post
        .aggregate([
          { $match: { tags, active: true, deletedAt: { $eq: null } } },
          { $limit: limit },
          { $sort: { createdAt: -1 } },
          { $project: { __v: 0 } },
          { 
            $lookup: {
              from: 'users',
              as: 'users',
              localField: 'creatorId',
              foreignField: '_id',
              pipeline: [{ $project: { __v: 0, password: 0, deletedAt: 0 } }]
            }
          }
        ])
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
      message: `Posts`,
      data: {
        posts
      },
      paginationMetaData
    }
	},

  async accounts(ctx){
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
    const search = query.search || ''
    const paginationMetaData = {}

    const startIndex = page === 1 ? 0 : (page - 1) * limit;
    const endIndex = page * limit;
    paginationMetaData.page = page
    paginationMetaData.limit = limit

    if (startIndex > 0){
      paginationMetaData.prevPage = page - 1
      paginationMetaData.hasPrevPage = true
    }

    let accounts = []
   
    const total = search.length ? await User.countDocuments({ username: { $regex: search, $options: 'i' }, active: true, deletedAt: { $eq: null } }).exec() : 0
    paginationMetaData.totalPages = Math.ceil(total / limit)
    paginationMetaData.total = total

    if (endIndex < total) {
      paginationMetaData.nextPage = page + 1
      paginationMetaData.hasNextPage = true
    }

    try{
      accounts = search.length ? await User.find({ username: { $regex: search, $options: 'i' }, active: true, deletedAt: { $eq: null } })
      .select({ __v: 0, deletedAt: 0, password: 0 })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit) : []
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
      message: `Accounts`,
      data: {
        accounts
      },
      paginationMetaData
    }
	},

  async reels(ctx){
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
    const search = query.search || ''
    const paginationMetaData = {}

    const startIndex = page === 1 ? 0 : (page - 1) * limit;
    const endIndex = page * limit;
    paginationMetaData.page = page
    paginationMetaData.limit = limit

    if (startIndex > 0){
      paginationMetaData.prevPage = page - 1
      paginationMetaData.hasPrevPage = true
    }

    let reels = []
   
    const total = search.length ? 
      await Post.countDocuments({ title: { $regex: search, $options: 'i' }, reels: true, active: true, deletedAt: { $eq: null } }).exec() :
      await Post.countDocuments({ reels: true, active: true, deletedAt: { $eq: null } }).exec()
    paginationMetaData.totalPages = Math.ceil(total / limit)
    paginationMetaData.total = total

    if (endIndex < total) {
      paginationMetaData.nextPage = page + 1
      paginationMetaData.hasNextPage = true
    }

    try{
      reels = search.length ? 
        await Post.find({ title: { $regex: search, $options: 'i' }, reels: true, active: true, deletedAt: { $eq: null } })
          .select({ __v: 0, deletedAt: 0 })
          .sort({ createdAt: -1 })
          .skip(startIndex)
          .limit(limit)
          :
        await Post.find({ reels: true, active: true, deletedAt: { $eq: null } })
          .select({ __v: 0, deletedAt: 0 })
          .sort({ like: -1 })
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

  async tags(ctx){
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
    const search = query.search || ''
    const paginationMetaData = {}

    const startIndex = page === 1 ? 0 : (page - 1) * limit;
    const endIndex = page * limit;
    paginationMetaData.page = page
    paginationMetaData.limit = limit

    if (startIndex > 0){
      paginationMetaData.prevPage = page - 1
      paginationMetaData.hasPrevPage = true
    }

    let tags = []
   
    const total = await Post.countDocuments({ tags: { $in: search }, active: true, deletedAt: { $eq: null } }).exec()
    paginationMetaData.totalPages = Math.ceil(total / limit)
    paginationMetaData.total = total

    if (endIndex < total) {
      paginationMetaData.nextPage = page + 1
      paginationMetaData.hasNextPage = true
    }

    try{
      tags = await Post.find({ tags: { $in: search }, active: true, deletedAt: { $eq: null } })
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
       
		
    return ctx.body = {
      success: true,
      message: `Tags`,
      data: {
        tags
      },
      paginationMetaData
    }
  },

  async popularTags (ctx){
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

    let popularTags = []

    let date = new Date()
    date.setDate(date.getDate() - 7)

    try{
      popularTags = await Post.aggregate([
        { $match: { createdAt: { $gte: date }, active: true, deletedAt: { $eq: null } } },
        { $unwind: '$tags' },
        { $group: { _id : '$tags', count : { $sum : 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    } catch(ex){
      ctx.status = 500
      return ctx.body = {
        success: false,
        message: `Internal error`,
        data: null
      }
    }

    return ctx.body = {
      success: true,
      message: `Popular tags`,
      data: {
        popularTags
      }
    }
  },

  async tvs(ctx){
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
    const search = query.search || ''
    const paginationMetaData = {}

    const startIndex = page === 1 ? 0 : (page - 1) * limit;
    const endIndex = page * limit;
    paginationMetaData.page = page
    paginationMetaData.limit = limit

    if (startIndex > 0){
      paginationMetaData.prevPage = page - 1
      paginationMetaData.hasPrevPage = true
    }

    let tvs = []
   
    const total = await Post.countDocuments({ title: { $in: search }, tvs: true, active: true, deletedAt: { $eq: null } }).exec()
    paginationMetaData.totalPages = Math.ceil(total / limit)
    paginationMetaData.total = total

    if (endIndex < total) {
      paginationMetaData.nextPage = page + 1
      paginationMetaData.hasNextPage = true
    }

    try{
      tvs = await Post.find({ title: { $in: search }, tvs: true, active: true, deletedAt: { $eq: null } })
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
       
		
    return ctx.body = {
      success: true,
      message: `Tvs`,
      data: {
        tvs
      },
      paginationMetaData
    }
  }   
};