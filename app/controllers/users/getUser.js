const User = require('../../models/user')
const { matchedData } = require('express-validator')
const { handleError } = require('../../middleware/utils')
const { getItemSearch } = require('../../middleware/db')
const {
  validateHolderInternal
} = require('../../middleware/external/contractCalls')
/**
 * Get item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const getUser = async (req, res) => {
  try {
    req = matchedData(req)
    const isHolder = await validateHolderInternal(req.address)
    if (!isHolder)
      return res.status(404).json({ message: 'you need at least 1 token' })
    const resUser = await getItemSearch({ address: req.address }, User)
    if (resUser.length < 1) res.status(404).json({ message: 'Item not found' })
    else res.status(200).json(resUser[0])
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { getUser }
