const { blockIsExpired } = require('./blockIsExpired')
const { blockUser } = require('./blockUser')
const {
  checkLoginAttemptsAndBlockExpires
} = require('./checkLoginAttemptsAndBlockExpires')
const { checkPermissions } = require('./checkPermissions')
const { findForgotPassword } = require('./findForgotPassword')
const { findUser } = require('./findUser')
const { findUserByEmail } = require('./findUserByEmail')
const { findUserById } = require('./findUserById')
const { findUserToResetPassword } = require('./findUserToResetPassword')
const { forgotPasswordResponse } = require('./forgotPasswordResponse')
const { generateToken } = require('./generateToken')
const { getUserIdFromToken } = require('./getUserIdFromToken')
const { markResetPasswordAsUsed } = require('./markResetPasswordAsUsed')
const { passwordsDoNotMatch } = require('./passwordsDoNotMatch')
const { registerUser } = require('./registerUser')
const { returnRegisterToken } = require('./returnRegisterToken')
const { saveForgotPassword } = require('./saveForgotPassword')
const { saveLoginAttemptsToDB } = require('./saveLoginAttemptsToDB')
const {
  saveUserAccessAndReturnToken
} = require('./saveUserAccessAndReturnToken')
const { setUserInfo } = require('./setUserInfo')
const { updatePassword } = require('./updatePassword')
const { userIsBlocked } = require('./userIsBlocked')
const { verificationExists } = require('./verificationExists')
const { verifyUser } = require('./verifyUser')
const { discordInvite } = require('./discordInvite')
const {
  saveAddressAccessAndReturnNonce
} = require('./saveAddressAccessAndReturnNonce')

module.exports = {
  blockIsExpired,
  blockUser,
  checkLoginAttemptsAndBlockExpires,
  checkPermissions,
  findForgotPassword,
  findUser,
  findUserByEmail,
  findUserById,
  findUserToResetPassword,
  forgotPasswordResponse,
  generateToken,
  getUserIdFromToken,
  markResetPasswordAsUsed,
  passwordsDoNotMatch,
  registerUser,
  returnRegisterToken,
  saveForgotPassword,
  saveLoginAttemptsToDB,
  saveUserAccessAndReturnToken,
  setUserInfo,
  updatePassword,
  userIsBlocked,
  verificationExists,
  verifyUser,
  discordInvite,
  saveAddressAccessAndReturnNonce
}
