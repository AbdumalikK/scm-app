import Router from 'koa-router'

import reportController from './controllers/report-controller'
import checkUser from '../../handlers/checkUser'
import checkId from './handlers/check-id'

const router = new Router({ prefix: '/report' })

router
    .param('id', checkId())
    
    .get('/', checkUser(), reportController.getReports)
    .post('/', checkUser(), reportController.addReport)
    .delete('/:id', checkUser(), reportController.deleteReport)

export default router.routes()