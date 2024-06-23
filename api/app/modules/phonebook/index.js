import Router from 'koa-router'

import phonebookController from './controllers/phonebook-controller'
import checkUser from '../../handlers/checkUser'

const router = new Router({ prefix: '/phonebook' })

router
    .get('/friends', checkUser(), phonebookController.getFriends)
    .post('/', checkUser(), phonebookController.addPhonebook)
    .delete('/', checkUser(), phonebookController.deletePhonebooks)
    

export default router.routes()