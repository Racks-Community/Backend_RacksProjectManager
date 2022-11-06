const PendingContributor = require('../../models/pendingContributor')
const { matchedData } = require('express-validator')
const { isIDGood, handleError } = require('../../middleware/utils')
const { createItem } = require('../../middleware/db')
const { validateHolderInternal } = require('../../middleware/auth')
const { getUserIdFromToken, findUserById } = require('../auth/helpers')

/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const updateUserToContributor = async (req, res) => {
  try {
    const tokenEncrypted = req.headers.authorization
      .replace('Bearer ', '')
      .trim()

    req = matchedData(req)
    const isHolder = await validateHolderInternal(req.address)
    if (!isHolder)
      return res.status(404).json({ message: 'you need at least 1 token' })

    let userId = await getUserIdFromToken(tokenEncrypted)
    userId = await isIDGood(userId)
    const user = await findUserById(userId)
    if (user.address !== req.address)
      return res.status(409).json({ message: 'Integrity violation' })

    await createItem(req, PendingContributor)

    return res.status(200).json(true)
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { updateUserToContributor }
