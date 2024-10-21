// pages/api/send-email.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, subject, message } = req.body;

    // Create a transporter object using your email service
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // Gmail SMTP server
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'octopuss732@gmail.com', // your email
        pass: 'desq fkak srfj vonn', // your email password or app-specific password
      },
    });

    // Define email options
    const mailOptions = {
      from: 'octopuss732@gmail.com',
      to: email,
      subject: subject,
      text: message,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error sending email' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
