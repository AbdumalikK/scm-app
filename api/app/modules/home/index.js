import Router from 'koa-router'

import homeController from './controllers/home-controller'
import checkUser from '../../handlers/checkUser'
import checkId from './handlers/check-id'


const router = new Router({ prefix: '/' })

router
    .param('id', checkId())
    
    .get('/feed', checkUser(), homeController.getFeeds)

    // .get('/history', checkUser(), homeController.getHistories)

export default router.routes()