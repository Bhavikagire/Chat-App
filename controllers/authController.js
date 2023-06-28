const nodemailer = require('nodemailer');

require('dotenv').config();

const crypto = require('crypto');

const generateVerificationToken = () => {
    // Generate a random verification token
    const token = crypto.randomBytes(32).toString('hex');
    return token;
};

const sendVerificationEmail = async (email, verificationToken) => {
    const verificationLink = `http://localhost:8000/users/verify/${verificationToken}`;

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Verification',
            text: `Please click on the following link to verify your email: ${verificationLink}`,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log('Error sending verification email:', error);
        throw error;
    }
};


module.exports = { generateVerificationToken, sendVerificationEmail };
