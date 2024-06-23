import Router from 'koa-router'

import interestController from './controllers/interest-controller'
import checkUser from '../../handlers/checkUser'
import checkId from './handlers/check-id'

const router = new Router({ prefix: '/interest' })

router
    .param('id', checkId())
    
    .get('/search', checkUser(), interestController.search)
    .get('/', checkUser(), interestController.getInterest)
    .post('/', checkUser(), interestController.addInterest)
    .delete('/:id', checkUser(), interestController.deleteInterest)

export default router.routes()