import axios from 'axios'

import {
    SMS_HOST, SMS_LOGIN, SMS_PASSWORD
} from '../config';

export const SMSService = async (phone, text) => {
    return axios.post(SMS_HOST, {
        messages: [{
            'recipient': phone.substr(1,12),
            'message-id': new Date().getTime(),
            'sms': {
                'originator': 3700,
                'content': { 'text': text }
            }
        }]
    }, { auth: { username: SMS_LOGIN, password: SMS_PASSWORD } })
}