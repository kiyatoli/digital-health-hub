const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});

exports.sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: 'no-reply@healthhub.com',
    to,
    subject,
    text
  };
  await transporter.sendMail(mailOptions);
};