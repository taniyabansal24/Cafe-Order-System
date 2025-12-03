// lib/verificationService.js
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

class VerificationService {
    constructor() {
        this.emailTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        // Initialize Twilio only if credentials exist
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            this.twilioClient = twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );
        }
    }

    generateOTP() {
        return crypto.randomInt(100000, 999999).toString();
    }

    async sendEmailOTP(email, otp) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Email Verification OTP - Cafe Management',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Email Verification</h2>
                        <p>Your OTP for email verification is:</p>
                        <h1 style="background: #f4f4f4; padding: 15px; text-align: center; letter-spacing: 5px; font-size: 24px;">
                            ${otp}
                        </h1>
                        <p>This OTP will expire in 10 minutes.</p>
                        <p>If you didn't request this, please ignore this email.</p>
                    </div>
                `
            };

            await this.emailTransporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Email sending error:', error);
            throw new Error('Failed to send email OTP');
        }
    }

    async sendSMSOTP(phone, otp) {
        try {
            if (!this.twilioClient) {
                console.log(`SMS OTP for ${phone}: ${otp}`);
                return true; // Mock SMS in development
            }

            await this.twilioClient.messages.create({
                body: `Your Cafe Management verification OTP is: ${otp}. Valid for 10 minutes.`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phone
            });
            return true;
        } catch (error) {
            console.error('SMS sending error:', error);
            throw new Error('Failed to send SMS OTP');
        }
    }

    isOTPExpired(expiryTime) {
        return Date.now() > new Date(expiryTime).getTime();
    }
}

module.exports = new VerificationService();