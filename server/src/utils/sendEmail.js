const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
        port: process.env.SMTP_PORT || 2525,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    // Define message
    const message = {
        from: `${process.env.FROM_NAME || 'URL Shortener'} <${process.env.FROM_EMAIL || 'noreply@urlshortner.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    // For dev/showcase: Print to console
    console.log('--- EMAIL SIMULATION ---');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    console.log('------------------------');

    // Only try to send if we have SMTP credentials
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
            const info = await transporter.sendMail(message);
            console.log('Email sent: %s', info.messageId);
        } catch (err) {
            console.warn('Email delivery failed (SMTP error), check your credentials.');
        }
    }
};

module.exports = sendEmail;
