const model = require('../../models/user')
const { matchedData } = require('express-validator')
const { handleError } = require('../../middleware/utils')
const { deleteItemSearch } = require('../../middleware/db')

/**
 * Delete item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const deleteUser = async (req, res) => {
  try {
    req = matchedData(req)
    res
      .status(200)
      .json(await deleteItemSearch({ address: req.address }, model))
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { deleteUser }
