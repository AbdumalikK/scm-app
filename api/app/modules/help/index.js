import Router from 'koa-router'

import helpController from './controllers/help-controller'
import checkUser from '../../handlers/checkUser'


const router = new Router()

router
    
    .get('/block', checkUser(), helpController.getHelps)
    .post('/block', checkUser(), helpController.addHelp)
    .post('/unblock', checkUser(), helpController.deleteHelp)

export default router.routes()