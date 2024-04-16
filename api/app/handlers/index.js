import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'
import logger from 'koa-logger'
import error from './error'
import jwt from './jwt'
import { IS_DEV } from '../utils/env'
import { KEY_SECRET } from '../config'

const session = require('koa-session');

const CONFIG = {
	key: 'koa.sess', /** (string) cookie key (default is koa.sess) */
	/** (number || 'session') maxAge in ms (default is 1 days) */
	/** 'session' will result in a cookie that expires when session/browser is closed */
	/** Warning: If a session cookie is stolen, this cookie will never expire */
	maxAge: 86400000,
	autoCommit: true, /** (boolean) automatically commit headers (default true) */
	overwrite: true, /** (boolean) can overwrite or not (default true) */
	httpOnly: true, /** (boolean) httpOnly or not (default true) */
	signed: true, /** (boolean) signed or not (default true) */
	rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
	renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
	secure: false, /** (boolean) secure cookie*/
	sameSite: null, /** (string) session cookie sameSite options (default null, don't set it) */
  };

export default (app) => {
	if(IS_DEV){
		app.use(logger())
	}

	app.keys = [KEY_SECRET];

	app.use(cors())
	app.use(error())
	app.use(bodyParser())
	app.use(jwt())
	app.use(session(CONFIG, app))
}
