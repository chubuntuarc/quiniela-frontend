// import { createTransport } from 'nodemailer';

// async function sendEmail(to, subject, text) {
//   if (typeof window !== 'undefined') {
//     throw new Error('This function can only be used on the server side');
//   }

//   // Create a transporter using SMTP
//   let transporter = createTransport({
//     host: process.env.SMTP_HOST,
//     port: process.env.SMTP_PORT,
//     secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//   });

//   // Send mail with defined transport object
//   let info = await transporter.sendMail({
//     from: process.env.EMAIL_FROM, // sender address
//     to: to, // list of receivers
//     subject: subject, // Subject line
//     text: text, // plain text body
//   });

//   console.log('Message sent: %s', info.messageId);
//   return info;
// }

// export default { sendEmail };
