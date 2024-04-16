import nodemailer from 'nodemailer'

import { OTP as OTPTemplate } from '../modules/auth/templates/register-otp'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'usertestreverem@gmail.com',
        pass: `wsif stey avry tlap`
    }
});


export const MailService = async (to, otp, username) => {
    const mailOptions = {
        from: 'Reverem  <noreply@reverem.uz>',
        to,
        subject: 'Roʻyxatdan oʻtish',
        html: OTPTemplate(otp, username)
    };


    return transporter.sendMail(mailOptions);
}