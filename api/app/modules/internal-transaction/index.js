import Router from 'koa-router'

import internalTransactionController from './controllers/internal-transaction-controller'
import checkUser from '../../handlers/checkUser'

const router = new Router({ prefix: '/internal-transaction' })

router
    .post('/convert', checkUser(), internalTransactionController.convertCoin)
    .get('/balance', checkUser(), internalTransactionController.walletBalance)
    
    .get('/', checkUser(), internalTransactionController.getInternalTransactions)
    .post('/', checkUser(), internalTransactionController.addInternalTransaction)


export default router.routes()