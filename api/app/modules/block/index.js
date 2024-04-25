import Router from 'koa-router'

import blockController from './controllers/block-controller'
import checkUser from '../../handlers/checkUser'


const router = new Router()

router
    .get('/block', checkUser(), blockController.getBlockedUsers)
    .post('/block', checkUser(), blockController.blockUser)
    .post('/unblock', checkUser(), blockController.unblockUser)

export default router.routes()