const { matchedData } = require('express-validator')
const Project = require('../../models/project')
const { getItemSearch } = require('../../middleware/db')
const { handleError } = require('../../middleware/utils')

/**
 * Get item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const getProject = async (req, res) => {
  try {
    req = matchedData(req)
    res.status(200).json(await getItemSearch({ address: req.address }, Project))
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { getProject }
