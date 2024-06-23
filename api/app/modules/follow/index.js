import Router from 'koa-router'

import followController from './controllers/follow-controller'
import checkUser from '../../handlers/checkUser'
import checkFollowingId from './handlers/check-following-id'
import checkFollowerId from './handlers/check-follower-id'


const router = new Router()

router
    .param('followingId', checkFollowingId())
    .param('followerId', checkFollowerId())

    // followings
    .get('/followings', checkUser(), followController.getFollowings)
    .post('/following', checkUser(), followController.addFollowing)
    .delete('/following/:followingId', checkUser(), followController.deleteFollowing)

    // followers
    .get('/followers', checkUser(), followController.getFollowers)
    .delete('/follower/:followerId', checkUser(), followController.deleteFollower)

export default router.routes()