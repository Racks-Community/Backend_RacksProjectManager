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
const getUserFromId = async (req, res) => {
  try {
    req = matchedData(req)

    const resUser = await getItemSearch({ _id: req.id }, User)
    if (resUser.length < 1) res.status(404).json({ message: 'Item not found' })
    else res.status(200).json(resUser[0])
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { getUserFromId }
