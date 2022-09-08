const model = require('../../models/pendingContributor')
const { matchedData } = require('express-validator')
const { isIDGood, handleError } = require('../../middleware/utils')
const { deleteItemSearch } = require('../../middleware/db')
const { getUserIdFromToken, findUserById } = require('../auth/helpers')

/**
 * Delete item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const deletePendingContributor = async (req, res) => {
  try {
    const tokenEncrypted = req.headers.authorization
      .replace('Bearer ', '')
      .trim()

    req = matchedData(req)

    let userId = await getUserIdFromToken(tokenEncrypted)
    userId = await isIDGood(userId)
    const user = await findUserById(userId)
    if (user.address !== req.address)
      return res.status(409).json({ message: 'Integrity violation' })
    res
      .status(200)
      .json(await deleteItemSearch({ address: req.address }, model))
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { deletePendingContributor }
