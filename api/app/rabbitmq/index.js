import amqp from 'amqplib';
import server from '../server';
import { RABBITMQ_URI } from '../config';

import logger from '../utils/logs/logger';

let connection, channel;

export default async function rabbitMQInit(){
	try{
		connection = await amqp.connect(RABBITMQ_URI)
		channel = await connection.createChannel()


		// connect to queue or create one if it does not exist already
		// durable: true - all messages will not be lost if rabbitMQ is shut down for any reason
		await channel.assertQueue('sms', { durable: true })
		await channel.assertQueue('notification', { durable: true })

		// prefetch limit of messages to consume method
		await channel.prefetch(1)

		// init all consumers
		// await eventRetryConsumer()
		SmsConsumer()
		NotificationConsumer()
	}catch(ex){
		logger.error(`----- Error in rabbitmq init. status=${ex.status}. message=${ex.message} -----`);
		server.close();
	}
}

export const assert = async (queueName, data) => {
	console.log(`----- Publishing '${queueName}'. -----`)
	logger.info(`----- Publishing '${queueName}'. -----`)
	switch(queueName){
		case 'sms': {
				await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
				break
        }
		case 'FS_RETRY': {
			await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
			break
		}
		default: {
			logger.error(`----- Error. Invalid queue name detected '${queueName}' -----`)
			console.error(`----- Error. Invalid queue name detected '${queueName}' -----`)
			break
		}
	}

	// close the channel and connection
	// await channel.close();
	// await connection.close();
}

// push generated xlsx report or pdf file to the telegram channel
function SmsConsumer(){
	channel.consume('sms', async (data) => {
		const { text, phone } = JSON.parse(data.content)

		logger.info(`Consuming 'sms'. [x] Received ${data.content.toString()}`)
		console.log(`Consuming 'sms' [x] Received ${data.content.toString()}`)

		if(!text){
			logger.error(`Error. SmsConsumer. Text not found`)
            return
		}

        if(!phone){
			logger.error(`Error. SmsConsumer. Text not found`)
            return
        }

        SMSService(phone, text)
			.then(() => {
                channel.ack(data);
				ctx.status = 201
				return ctx.body = {
					success: true,
					message: `Sms sent successfully`,
					data: null
				}
			})
			.catch(async error => {
				ctx.status = 500
				return ctx.body = {
					success: false,
					message: `Failed to send sms. ${error}`,
					data: null
				}
			})
	});
}
