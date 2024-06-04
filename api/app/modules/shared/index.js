import Router from 'koa-router'

import sharedController from './controllers/shared-controller'
import checkUser from '../../handlers/checkUser'
import checkId from './handlers/check-id'

const router = new Router({ prefix: '/saved' })

router
    .param('id', checkId())
    
    .get('/', checkUser(), sharedController.getShareds)
    .post('/', checkUser(), sharedController.addShared)
    .delete('/:id', checkUser(), sharedController.deleteShared)

export default router.routes()