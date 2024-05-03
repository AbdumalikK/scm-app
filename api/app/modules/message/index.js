import Router from 'koa-router'

import messageController from './controllers/message-controller'
import checkUser from '../../handlers/checkUser'
import checkId from './handlers/check-id'

const router = new Router({ prefix: '/message' })

router
    .param('id', checkId())

    .get('/', checkUser(), messageController.getMessages)
    .post('/', checkUser(), messageController.addMessage)
    .patch('/:id', checkUser(), messageController.updateMessage)
    .delete('/:id', checkUser(), messageController.deleteMessage)


export default router.routes()