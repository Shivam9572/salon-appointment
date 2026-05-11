import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS
  }
});

export const sendOTPEmail = async (to, otp) => {
  
  await transporter.sendMail({
    from: `"onlinesalon" <${process.env.BREVO_SENDER}>`,
    to,
    subject: 'Your OTP Code',
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:auto">
        <h2>Email Verification</h2>
        <p>Your OTP code is:</p>
        <h1 style="letter-spacing:8px;color:#4F46E5">${otp}</h1>
        <p>Valid for <b>5 minutes</b>. Do not share it.</p>
      </div>
    `
  });
};

