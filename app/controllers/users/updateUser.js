const User = require('../../models/user')
const { matchedData } = require('express-validator')
const { isIDGood, handleError } = require('../../middleware/utils')
const { updateItemSearch } = require('../../middleware/db')
const { validateHolderInternal } = require('../../middleware/auth')
const { getUserIdFromToken, findUserById } = require('../auth/helpers')
/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const updateUser = async (req, res) => {
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

    if (!user.verified && user.contributor) {
      req.verified = true
    }
    res
      .status(200)
      .json(await updateItemSearch({ address: user.address }, User, req))
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { updateUser }
