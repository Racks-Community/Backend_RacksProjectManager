const { emailExists, emailExistEvent } = require('./emailExists')
const { emailExistsExcludingMyself } = require('./emailExistsExcludingMyself')
const { prepareToSendEmail } = require('./prepareToSendEmail')
const { sendEmail } = require('./sendEmail')
const {
  sendRegistrationEmailMessage
} = require('./sendRegistrationEmailMessage')
const {
  sendResetPasswordEmailMessage
} = require('./sendResetPasswordEmailMessage')
const {
  orderComplete
} = require('./sendCustomEmails')

module.exports = {
  emailExists,
  emailExistsExcludingMyself,
  prepareToSendEmail,
  sendEmail,
  sendRegistrationEmailMessage,
  sendResetPasswordEmailMessage,
  orderComplete,
  emailExistEvent
}
