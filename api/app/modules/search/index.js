import Router from 'koa-router'

import searchController from './controllers/search-controller'
import checkUser from '../../handlers/checkUser'

const router = new Router({ prefix: '/search' })

router
    .get('/', checkUser(), searchController.search)
export default router.routes()