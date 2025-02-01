// Looking to send emails in production? Check out our Email API/SMTP product!
const Nodemailer = require("nodemailer");
const { MailtrapTransport } = require("mailtrap");

const transport = Nodemailer.createTransport(
  MailtrapTransport({
    token: process.env.MAILTRAP_TOKEN,
    testInboxId: process.env.MAILTRAP_TEST_INBOX_ID,
  })
);

const sender = {
  address: process.env.MAILTRAP_FROM_ADDRESS,
  name: process.env.MAILTRAP_FROM_NAME
};

module.exports = { transport, sender };