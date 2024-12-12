const nodemailer = require('nodemailer');
const EmailError = require('../errors/email-error');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `Shop Re:Books <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html, 
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new EmailError('Error sending email');
  }
};

module.exports = sendEmail;
