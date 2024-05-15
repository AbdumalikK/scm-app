import async_redis from 'async-redis'
import path from 'path'
import fs from 'fs'
import http from 'http'
import { Server } from 'socket.io'

import app from './app'
import { init } from './modules/chat/socket'
import { PORT, REDIS_PORT, ERRORS, errors } from './config'
import logger from './utils/logs/logger'

// directories
const imagesDir = path.resolve(path.join(process.cwd() + '/uploads/images'))
const videosDir = path.resolve(path.join(process.cwd() + '/uploads/videos'))
const logsDir = path.resolve(path.join(process.cwd() + '/logs'))

if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true })

if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true })

if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true })


// redis
const client = async_redis.createClient(REDIS_PORT)

client.on('error', function(error) {
	logger.error(`Redis error. ${error}`)

	throw new Error(error)
});

client.set(Object.keys(errors)[0], JSON.stringify(ERRORS))


// server
const server = http.createServer(app.callback())

server.listen(PORT, (err) => {
	if (err) logger.error(err);

	console.log(`Listening at http://localhost:${PORT}`);
}); 


// socket io
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3001']
    },
	allowEIO3: true,
    // credentials: false,
    allowedHeaders: {
        'Access-Control-Allow-Credentials': true,
    },
    // cors: {
    //     origin: 'http://localhost:3001'
    // },
    // path: '/socket.io',
    // transports: ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling', 'polling']
})

// chat socket
init()


export default server;

export { client, io }