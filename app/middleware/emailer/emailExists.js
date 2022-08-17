const User = require('../../models/user')
const { buildErrObject } = require('../../middleware/utils')

/**
 * Checks User model if user with an specific email exists
 * @param {string} email - user email
 */
const emailExists = (email = '') => {
  return new Promise((resolve, reject) => {
    User.findOne(
      {
        email
      },
      (err, item) => {
        if (err) {
          return reject(buildErrObject(422, err.message))
        }

        if (item) {
          return reject(buildErrObject(422, 'EMAIL_ALREADY_EXISTS'))
        }
        resolve(false)
      }
    )
  })
}


const emailExistEvent = (email = '', model, id_event) => {
  let query = {'id_event': { $eq : id_event }, 'user_data.email' : { $eq : email}}; 
  return new Promise((resolve, reject) => {
    model.find(
       query,
      (err, item) => {
        if (err) {
          return reject(buildErrObject(422, err.message))
        }
        if (item.length) {
          return reject(buildErrObject(422, 'EMAIL_ALREADY_EXISTS'))
        }
        resolve(false)
      }
    )
  })
  // return new Promise((resolve, reject) => {
  //   model.findOne(
  //     {
  //       email
  //     },
  //     (err, item) => {
  //       if (err) {
  //         return reject(buildErrObject(422, err.message))
  //       }
  //       if (item) {
  //         return reject(buildErrObject(422, 'EMAIL_ALREADY_EXISTS'))
  //       }
  //       resolve(false)
  //     }
  //   )
  // })
}

module.exports = { emailExists, emailExistEvent }
