import Router from 'koa-router'

import auth from './auth'
import token from './token'
import home from './home'
import user from './user'
import post from './post'
import follow from './follow'
import block from './block'
import chat from './chat'
import message from './message'
import story from './story'
import saved from './saved'
import report from './report'
import search from './search'
import area from './area'
import interest from './interest'
import phonebook from './phonebook'
import internalTransaction from './internal-transaction'
import currency from './currency'
import targetAudience from './target-audience'

const router = new Router()

router.use(auth)
router.use(token)
router.use(home)
router.use(user)
router.use(post)
router.use(follow)
router.use(block)
router.use(chat)
router.use(message)
router.use(story)
router.use(saved)
router.use(report)
router.use(search)
router.use(area)
router.use(interest)
router.use(phonebook)
router.use(internalTransaction)
router.use(currency)
router.use(targetAudience)


export default router.routes()