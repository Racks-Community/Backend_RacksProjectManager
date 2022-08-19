const Project = require('../../models/project')
const { updateItemSearch } = require('../../middleware/db')
const { handleError } = require('../../middleware/utils')
const { matchedData } = require('express-validator')

/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const updateProject = async (req, res) => {
  try {
    req = matchedData(req)
    res
      .status(200)
      .json(await updateItemSearch({ address: req.address }, Project, req))
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { updateProject }
