const nodemailer = require('nodemailer')
const mg = require('nodemailer-mailgun-transport')

/**
 * Sends email
 * @param {Object} data - data
 * @param {boolean} callback - callback
 */
const sendEmail = async (data = {}, callback) => {
  let auth = {}
  console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV === 'production') {
    // auth = {
    //   auth: {
    //     api_key: process.env.EMAIL_SMTP_API_MAILGUN,
    //     domain: process.env.EMAIL_SMTP_DOMAIN_MAILGUN
    //   }
    // }
    auth = {
      host: process.env.EMAIL_SMTP,
      port: process.env.EMAIL_SMTP_PORT,
      auth: {
        // eslint-disable-next-line camelcase
        user: process.env.EMAIL_SMTP_USER,
        pass: process.env.EMAIL_SMTP_PASS
      }
    }
  } else {
    auth = {
      host: process.env.EMAIL_SMTP,
      port: process.env.EMAIL_SMTP_PORT,
      auth: {
        // eslint-disable-next-line camelcase
        user: process.env.EMAIL_SMTP_USER,
        pass: process.env.EMAIL_SMTP_PASS
      }
    }
  }

  const transporter =
    process.env.NODE_ENV === 'production'
      ? nodemailer.createTransport(auth)
      : nodemailer.createTransport(auth)
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: `${data.user.name} <${data.user.email}>`,
    subject: data.subject,
    html: data.htmlMessage,
    replyTo: 'noreply.labs@racksmafia.com'
  }
  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      return callback(false)
    }
    return callback(true)
  })
}

module.exports = { sendEmail }