import Router from 'koa-router'

import settingsController from './controllers/settings-controller'
import checkUser from '../../handlers/checkUser'

const router = new Router({ prefix: '/settings' })

router
    .param('id', checkId())
    
    .get('/archive', checkUser(), settingsController.getArchives)

export default router.routes()