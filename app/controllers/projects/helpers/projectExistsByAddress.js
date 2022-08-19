const Project = require('../../../models/project')
const { buildErrObject } = require('../../../middleware/utils')

/**
 * Checks if a city already exists in database
 * @param {string} address - name of item
 */
const projectExistsByAddress = (address = '') => {
  return new Promise((resolve, reject) => {
    Project.findOne(
      {
        address
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

module.exports = { projectExistsByAddress }
