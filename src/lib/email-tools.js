import sgMail from "@sendgrid/mail";

// Set apikey
sgMail.setApiKey(process.env.SENDGRIDMAIL_KEY);

async function sendAuthorEmail(recipientEmail) {
  // Message content - sender, recipient, content etc.
  const message = {
    to: recipientEmail,
    from: process.env.SENDER_EMAIL,
    subject: `Thank you, for submitting a blog post on our site!`,
    text: "This is fallback text to show if email application does not render html",
    html: `<h2>Hello!</h2><hr><p>Thank you for submitting a blog post!</p>`,
  };
  // Send e-mail
  await sgMail.send(message);
}

export default sendAuthorEmail;

// Add here later handler also for author registration?