import nodemailer from 'nodemailer'
import { MailOptions } from 'nodemailer/lib/smtp-transport';


interface EmailType {
    to: string,
    subject: string,
    body: string
}
class EmailService {
    private transporter;
    constructor(){
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error('Email credentials are not configured')
        }

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smpt.gmail.com',
            port: 465,
            secure: true,
            auth: {
                pass: process.env.EMAIL_PASS,
                user: process.env.EMAIL_USER
            }
        })
    }
    async Email(emailData: EmailType) {
        try {
            const mailOptions: MailOptions = {
                from: process.env.EMAIL_USER,
                to: emailData.to,
                subject: emailData.subject,
                text: emailData.body
            }

            await this.transporter.sendMail(mailOptions)
            console.log('Email sent to: ', emailData.to)
            return { success: true }
        } catch (error) {
            console.error('Error sending email: ', error)
            return { success: false, error };
        }
    }
}
export const sendEmail = new EmailService()
