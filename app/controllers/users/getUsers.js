const User = require('../../models/user')
const { handleError } = require('../../middleware/utils')
const { getItems, checkQueryString } = require('../../middleware/db')

/**
 * Get items function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const getUsers = async (req, res) => {
  try {
    const query = await checkQueryString(req.query)
    const users = await getItems(req, User, query)
    const contributors = users.docs.filter(
      (user) => user.contributor && user.verified && user.role === 'user'
    )
    res.status(200).json(contributors)
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { getUsers }
