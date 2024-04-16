import { MONGO_URI } from '../config';
import mongooseConnector from './mongoose-connector';
import server from '../server';
import logger from '../utils/logs/logger';

async function connectorsInit(){
	try{
		await mongooseConnector(MONGO_URI);
	}catch(ex){
		console.log(`Mongoose init error. status=${ex.status}. message=${ex.message}`)
		server.close();
	}
}

export {
	mongooseConnector
};

export default connectorsInit;