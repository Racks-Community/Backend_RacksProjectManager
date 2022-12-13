const User = require('../../models/user')
const { getItemSearch } = require('../db')
const { handleError } = require('../utils/handleError')

const getAdmin = async (req, res) => {
  try {
    const resUser = await getItemSearch({ role: 'admin' }, User)
    res.status(200).json(resUser[0]._id)
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { getAdmin }
