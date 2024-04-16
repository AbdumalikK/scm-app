import config from 'config'
import dotenv from 'dotenv'
import fs from 'fs'

import envs from './constants/envs'
import env, { IS_TEST } from './utils/env'

import logger from './utils/logs/logger'

if(!IS_TEST){
	dotenv.config();
}

if(!envs[env]){
	logger.error(`unknown env '${env}'`);
	throw Error(`unknown env '${env}'`);
}

const PORT = config.has('core.port') ? config.get('core.port') : undefined,
	  MONGO_URI = config.has('db.mongo.uri') ? config.get('db.mongo.uri') : process.env.MONGO_URI,
	  RABBITMQ_URI = config.has('rabbitmq.uri') ? config.get('rabbitmq.uri') : undefined,
	  JWT_SECRET = config.has('jwt.secret') ? config.get('jwt.secret') : undefined,
	  REDIS_PORT = config.has('redis.port') ? config.get('redis.port') : undefined,
	  ERRS = config.has('errors_file_path') ? config.get('errors_file_path') : null,
	  CHARSET = config.has('charset') ? config.get('charset') : 0,
	  GENERATE_PASSWORD_LENGTH = config.has('generate_password_length') ?
		  config.get('generate_password_length') : 0,
	  CLIENT_APP_IMAGES_PATH = config.has('upload_path') ?
		  config.get('upload_path') : null,
	  KEY_SECRET = config.has('key.secret') ?
		  config.get('key.secret') : null,

	GOOGLE_CLIENT_ID = config.has('google.client.id') ?
	config.get('google.client.id') : null,
	GOOGLE_CLIENT_SECRET = config.has('google.client.secret') ?
	config.get('google.client.secret') : null,

	FACEBOOK_APP_ID = config.has('facebook.app.id') ?
	config.get('facebook.app.id') : null,
	FACEBOOK_APP_SECRET = config.has('facebook.app.secret') ?
	config.get('facebook.app.secret') : null,

	SMS_HOST = config.has('sms.host') ?
		config.get('sms.host') : null,
	SMS_LOGIN = config.has('sms.login') ?
		config.get('sms.login') : null,
	SMS_PASSWORD = config.has('sms.password') ?
		config.get('sms.password') : null

if(!JWT_SECRET){
	throw Error(`----- You must pass jwt secret string -----`)
}

if(!KEY_SECRET){
	throw Error(`----- You must pass key secret string -----`)
}

if(!ERRS){
	throw Error(`----- Error file is not found -----`)
}

if(!MONGO_URI){
	throw Error(`----- Mongo uri is not found -----`)
}

if(!RABBITMQ_URI){
	throw Error(`----- Rabbitmq uri is not found -----`)
}

if(!CHARSET){
	throw Error(`----- UTF length is not found -----`)
}

if(!GENERATE_PASSWORD_LENGTH){
	throw Error(`----- Generate password length is not found -----`)
}

if(!CLIENT_APP_IMAGES_PATH){
	throw Error(`----- Client app images path is not found -----`)
}

if(!GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_SECRET){
	throw Error(`----- Google client is not found -----`);
}

if(!FACEBOOK_APP_ID && !FACEBOOK_APP_SECRET){
	throw Error(`----- Facebook app is not found -----`);
}

if(!SMS_HOST && !SMS_LOGIN && !SMS_PASSWORD){
	throw Error(`----- SMS credential is not found -----`);
}

const errors_raw_data = fs.readFileSync(__dirname + ERRS);
const errors = JSON.parse(errors_raw_data);

const ERRORS = errors['errors']

export {
	PORT, MONGO_URI, RABBITMQ_URI, JWT_SECRET, KEY_SECRET,
	REDIS_PORT, ERRORS, errors, CHARSET, GENERATE_PASSWORD_LENGTH,
	CLIENT_APP_IMAGES_PATH,

	GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
	FACEBOOK_APP_ID, FACEBOOK_APP_SECRET,

	SMS_HOST, SMS_LOGIN, SMS_PASSWORD
}