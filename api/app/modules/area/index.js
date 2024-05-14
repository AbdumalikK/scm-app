import Router from 'koa-router'

import areaController from './controllers/area-controller'
import checkUser from '../../handlers/checkUser'
import checkId from './handlers/check-id'

const router = new Router({ prefix: '/area' })

router
    .param('id', checkId())
    
    .get('/', checkUser(), areaController.getAreas)
    .post('/', checkUser(), areaController.addArea)
    .delete('/:id', checkUser(), areaController.deleteArea)

export default router.routes()