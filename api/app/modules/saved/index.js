import Router from 'koa-router'

import savedController from './controllers/saved-controller'
import checkUser from '../../handlers/checkUser'
import checkId from './handlers/check-id'

const router = new Router({ prefix: '/saved' })

router
    .param('id', checkId())
    
    .get('/', checkUser(), savedController.getSaveds)
    .post('/', checkUser(), savedController.addSaved)
    .delete('/:id', checkUser(), savedController.deleteSaved)

export default router.routes()