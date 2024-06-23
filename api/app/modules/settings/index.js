import Router from 'koa-router'

import settingsController from './controllers/settings-controller'
import checkUser from '../../handlers/checkUser'

const router = new Router({ prefix: '/settings' })

router
    .param('id', checkId())
    
    .get('/archive', checkUser(), settingsController.getArchives)

    .get('/privacy', checkUser(), settingsController.getPrivacy)
    .patch('/privacy', checkUser(), settingsController.updatePrivacy)

    .patch('/account/type', checkUser(), settingsController)

export default router.routes()