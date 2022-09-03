const Project = require('../../../models/project')
const { buildErrObject } = require('../../../middleware/utils')

/**
 * Checks if a city already exists in database
 * @param {string} name - name of item
 */
const projectExistsByName = (name = '') => {
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
          return resolve(true)
        }
        resolve(false)
      }
    )
  })
}

module.exports = { projectExistsByName }
