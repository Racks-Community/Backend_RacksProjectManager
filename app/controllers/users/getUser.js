const User = require('../../models/user')
const { matchedData } = require('express-validator')
const { handleError } = require('../../middleware/utils')
const { getItemSearch } = require('../../middleware/db')
const { validateHolderInternal } = require('../../middleware/auth')
/**
 * Get item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const getUser = async (req, res) => {
  try {
    req = matchedData(req)
    const isHolder = await validateHolderInternal(req.address)
    if (isHolder < 1)
      return res.status(404).json({ message: 'you need at least 1 token' })
    res.status(200).json(await getItemSearch({ address: req.address }, User))
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { getUser }
