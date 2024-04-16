import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import uuid from 'uuid/v4';

export default {
	genToken(data){
		return jwt.sign(data, JWT_SECRET, { expiresIn: '24h' });
	},

	genTokenPassword(data, secret){
		return jwt.sign(data, secret, { expiresIn: '15m' })
	},

	verifyTokenPassword(token, secret){
		return jwt.verify(token, secret);
	},
	
	verify(token){
		return jwt.verify(token, JWT_SECRET);
	},
	
	refreshToken(){
		const refreshToken = uuid();
		return refreshToken;
	}
};