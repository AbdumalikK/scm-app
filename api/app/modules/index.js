import Router from 'koa-router'

import auth from './auth'
import token from './token'
import home from './home'
import user from './user'

const router = new Router()

router.use(auth)
router.use(token)
router.use(home)
router.use(user)

export default router.routes()