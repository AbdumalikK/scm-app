import mongoose from 'mongoose';
import logger from '../utils/logs/logger';

mongoose.Promise = Promise;

export default (mongo_uri) => {
	return mongoose
		.connect(mongo_uri, {
			useNewUrlParser: true,
			useCreateIndex: true,
			useUnifiedTopology: true,
			useFindAndModify: false
		})
		.then((mongodb) => {
			logger.info(`Mongo connected`);
			console.log('Mongo connected');
			return mongodb;
		});
};