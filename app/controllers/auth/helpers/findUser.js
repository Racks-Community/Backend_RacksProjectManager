const User = require('../../../models/user')
const { itemNotFound } = require('../../../middleware/utils')

/**
 * Finds user by address
 * @param {string} address - user´s address
 */
const findUser = (address = '') => {
  return new Promise((resolve, reject) => {
    User.findOne(
      {
        address
      },
      'password loginAttempts blockExpires name email role verified verification address',
      async (err, item) => {
        try {
          if(err)
            reject(err)
            // await itemNotFound(err, item, 'USER_DOES_NOT_EXIST')
          resolve(item)
        } catch (error) {
          reject(error)
        }
      }
    )
  })
}

module.exports = { findUser }
