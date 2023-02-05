const PendingProject = require('../../models/pendingProject')
const { matchedData } = require('express-validator')
const { handleError } = require('../../middleware/utils')
const { deleteItemSearch } = require('../../middleware/db')

/**
 * Delete item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const deletePendingProject = async (req, res) => {
  try {
    req = matchedData(req)
    res
      .status(200)
      .json(await deleteItemSearch({ name: req.name }, PendingProject))
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { deletePendingProject }
