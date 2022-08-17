const Project = require('../../../models/project')
const { buildErrObject } = require('../../../middleware/utils')

/**
 * Checks if a city already exists in database
 * @param {string} name - name of item
 */
const projectExists = (name = '') => {
  return new Promise((resolve, reject) => {
    Project.findOne(
      {
        name
      },
      (err, item) => {
        if (err) {
          return reject(buildErrObject(422, err.message))
        }

        if (item) {
          return reject(buildErrObject(422, 'PROJECT_ALREADY_EXISTS'))
        }
        resolve(false)
      }
    )
  })
}

module.exports = { projectExists }
