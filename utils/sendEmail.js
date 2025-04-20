const nodemailer = require("nodemailer");

// Function to send an email using Nodemailer
// This function takes an object with `to`, `subject`, and `text` properties as input
const sendEmail = async ({ to, subject, text }) => {
  // Create a transporter object to handle email sending
  // The transporter is configured to use Gmail as the email service
  const transporter = nodemailer.createTransport({
    service: "Gmail", // Specify the email service (Gmail in this case)
    auth: {
      user: process.env.EMAIL_USER, // Email address of the sender (from environment variables)
      pass: process.env.EMAIL_PASS, // Password or app-specific password for the sender's email
    },
  });

  // Send the email using the transporter
  await transporter.sendMail({
    from: process.env.EMAIL_USER, // Sender's email address
    to, // Recipient's email address
    subject, // Subject of the email
    text, // Body of the email (plain text)
  });
};

module.exports = sendEmail;
