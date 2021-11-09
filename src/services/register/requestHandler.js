import sgMail from "@sendgrid/mail";

// Set apikey
sgMail.setApiKey(process.env.SENDGRIDMAIL_KEY);

async function sendRegistrationEmail(recipientEmail, firstName, lastName) {
  // Message content - sender, recipient, content etc.
  const message = {
    to: recipientEmail,
    from: process.env.SENDER_EMAIL,
    subject: `Thank you, ${firstName} for registration!`,
    text: "This is fallback text to show if email application does not render html",
    html: `<h2>Hello ${firstName} ${lastName}</h2><hr><p>Thank you for registration!</p>`
  }
  // Send e-mail
  await sgMail.send(message);
}

export default sendRegistrationEmail;