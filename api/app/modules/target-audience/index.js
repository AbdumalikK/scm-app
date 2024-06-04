import Router from 'koa-router'

import targetAudienceController from './controllers/target-audience-controller'
import checkUser from '../../handlers/checkUser'
import checkId from './handlers/check-id'

const router = new Router({ prefix: '/target-audience' })

router
    .param('id', checkId())

    .get('/', checkUser(), targetAudienceController.getTargetAudiences)
    .delete('/:id', checkUser(), targetAudienceController.deleteTargetAudience)

export default router.routes()