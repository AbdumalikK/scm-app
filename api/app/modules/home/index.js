import Router from 'koa-router'

import homeController from './controllers/home-controller'
import checkUser from '../../handlers/checkUser'
import checkId from './handlers/check-id'


const router = new Router({ prefix: '/home' })

router
    .param('id', checkId())
    
    .get('/history', checkUser(), homeController.getHistories)
    .get('/feed', checkUser(), homeController.getFeeds)

    // .post('/post/like', checkUser(), homeController.addLike)

    // .get('/history', checkUser(), homeController.getHistories)

export default router.routes()