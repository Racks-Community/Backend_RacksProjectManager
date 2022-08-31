const { matchedData } = require('express-validator')

const {
  findUserByEmail,
  userIsBlocked,
  checkLoginAttemptsAndBlockExpires,
  passwordsDoNotMatch,
  saveLoginAttemptsToDB,
  saveUserAccessAndReturnToken
} = require('./helpers')

const { handleError } = require('../../middleware/utils')
const { checkPassword } = require('../../middleware/auth')

/**
 * Login function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const login = async (req, res) => {
  try {
    const data = matchedData(req)
    const user = await findUserByEmail(data.email)
    if (user) {
      await userIsBlocked(user)
      await checkLoginAttemptsAndBlockExpires(user)
      const isPasswordMatch = await checkPassword(data.password, user)
      if (!isPasswordMatch) {
        handleError(res, await passwordsDoNotMatch(user))
      } else {
        // all ok, register access and return token
        user.loginAttempts = 0
        await saveLoginAttemptsToDB(user)
        res.status(200).json(await saveUserAccessAndReturnToken(req, user))
      }
    } else {
      res.status(404).json('User not found')
    }
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { login }
