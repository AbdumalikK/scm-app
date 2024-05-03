import Router from 'koa-router'

import settingsController from './controllers/settings-controller'
import checkUser from '../../handlers/checkUser'

const router = new Router({ prefix: '/settings' })

router
    .param('id', checkId())
    
    .get('/', checkUser(), settingsController)
    .post('/', checkUser(), settingsController)
    .delete('/:id', checkUser(), settingsController)

export default router.routes()