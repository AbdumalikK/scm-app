import Router from 'koa-router'

import currencyController from './controllers/currency-controller'
import checkUser from '../../handlers/checkUser'
import checkId from './handlers/check-id'

const router = new Router({ prefix: '/currency' })

router
    .param('id', checkId())
    
    .get('/', checkUser(), currencyController.getCurrencies)
    .post('/', checkUser(), currencyController.addCurrency)
    .delete('/:id', checkUser(), currencyController.deleteCurrency)

export default router.routes()