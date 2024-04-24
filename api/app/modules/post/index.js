import Router from 'koa-router'

import postController from './controllers/post-controller'
import checkUser from '../../handlers/checkUser'
import checkCommentId from './handlers/check-comment-id'
import checkLikeId from './handlers/check-like-id'
import checkId from './handlers/check-id'


const router = new Router({ prefix: '/post' })

router
    .param('id', checkId())
    .param('commentId', checkCommentId())
    .param('likeId', checkLikeId())

    
    .get('/:id', checkUser(), postController.getPost)
    .get('/', checkUser(), postController.getPosts)
    .post('/', checkUser(), postController.addPost)
    .put('/:id', checkUser(), postController.updatePost)
    .delete('/:id', checkUser(), postController.deletePost)

    // comment
    .post('/:id/comment', checkUser(), postController.addPostComment)
    .patch('/:id/comment/:commentId', checkUser(), postController.updatePostComment)
    .delete('/:id/comment/:commentId', checkUser(), postController.deletePostComment)

    // comment likes
    .post('/:id/comment/:commentId/like', checkUser(), postController.addPostCommentLike)
    .delete('/:id/comment/:commentId/like/:likeId', checkUser(), postController.deletePostCommentLike)


    
    // // following & followers
    // .get('/follow', checkUser(), userController.getFollows)
    // .post('/follow', checkUser(), userController.addFollow)
    // .delete('/follow/:creatorId/:userId', checkUser(), userController.deleteFollow)

    // // block & unblock
    // .get('/block', checkUser(), userController.getBlockedUsers)
    // .post('/block', checkUser(), userController.blockUser)
    // .delete('/unblock/:userBlockId', checkUser(), userController.unblockUser)

    // // history
    // .post('/history', checkUser(), userController.addHistory)
    // .delete('/history/:historyId', checkUser(), userController.deleteHistory)

    // // post
    // .post('/post', checkUser(), userController.addPost)

export default router.routes()