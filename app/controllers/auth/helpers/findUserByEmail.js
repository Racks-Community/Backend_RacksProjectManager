const User = require('../../../models/user')

/**
 * Finds user by address
 * @param {string} email - user´s address
 */
const findUserByEmail = (email = '') => {
  return new Promise((resolve, reject) => {
    User.findOne(
      {
        email
      },
      'password loginAttempts blockExpires email role verified verification address contributor',
      async (err, item) => {
        try {
          if (err) reject(err)
          // await itemNotFound(err, item, 'USER_DOES_NOT_EXIST')
          resolve(item)
        } catch (error) {
          reject(error)
        }
      }
    )
  })
}

module.exports = { findUserByEmail }
