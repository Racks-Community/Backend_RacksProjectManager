const { handleError } = require('../../middleware/utils')
const { approveProjectInternal } = require('./approveProjectInternal')
const { matchedData } = require('express-validator')

/**
 * Approve project function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const approveProject = async (req, res) => {
  try {
    req = matchedData(req)

    return res
      .status(200)
      .json(await approveProjectInternal(req.address, req.approve))
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { approveProject }
