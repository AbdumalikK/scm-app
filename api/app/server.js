import async_redis from 'async-redis'
import path from 'path'
import fs from 'fs'

import {
	PORT, REDIS_PORT, ERRORS, errors
} from './config'

import app from './app'
import logger from './utils/logs/logger'

const client = async_redis.createClient(REDIS_PORT)


client.on("error", function(error) {
	logger.error(`Redis error. ${error}`)
	throw new Error(error)
});

client.set(Object.keys(errors)[0], JSON.stringify(ERRORS))

const server = app.listen(PORT, (err) => {
	if (err) logger.error(err);

	console.log(`Listening at http://localhost:${PORT}`);
});

const imagesDir = path.resolve(path.join(process.cwd() + '/uploads/images'))
const videosDir = path.resolve(path.join(process.cwd() + '/uploads/videos'))

if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true })

if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true })


export default server;

export { client }


// ---- TESTING ----
// function createApp(){
// 	return app;
// }

// if(!module.parent){
// 	createApp().listen(PORT, (err) => {
// 		if(err) console.log(err);
// 		console.log(`Listening at http://localhost:${PORT}`);
// 	})
// }

// export default createApp;