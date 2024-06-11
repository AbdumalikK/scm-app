import Router from 'koa-router'

import searchController from './controllers/search-controller'
import checkUser from '../../handlers/checkUser'

const router = new Router({ prefix: '/search' })

router
    .get('/', checkUser(), searchController.search)
    .get('/explore', checkUser(), searchController.explore)
    .get('/accounts', checkUser(), searchController.accounts)
    .get('/reels', checkUser(), searchController.reels)


export default router.routes()