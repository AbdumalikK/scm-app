import Router from 'koa-router';
import tokenController from './controllers/token-controller';
import check from './handlers/check';

const router = new Router();

router 
    .post('/refresh', tokenController.refresh)
    .post('/logout', check(), tokenController.logout);

export default router.routes();