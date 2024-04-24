import Koa from 'koa'
import serve from 'koa-static'
import path from 'path'

import connectorsInit from './connectors'
import initHandlers from './handlers'
import modules from './modules'
import AppError from './helpers/appError'

import logger from './utils/logs/logger'

connectorsInit()
global.AppError = AppError

const app = new Koa()

initHandlers(app)

app.use(async (ctx, next) => {
    const {
        originalUrl,
        request: {
            method,
            header
        },
        response: {
            status,
            message
        }
    } = ctx

    status >= 400 ?
        logger.error(`${method} ${originalUrl} ${status} ${header['content-length']} - ${header['user-agent']} ${header.host}. Message: ${message}`)
        :
        logger.info(`${method} ${originalUrl} - ${header['user-agent']} ${header.host}`)

    
    await next()
})

app.use(serve(path.join(__dirname, '../')))

app.use(modules);



export default app;