const { handleError } = require('../utils/handleError')
const { emailExists } = require('../../middleware/emailer')
const { createItemInDb } = require('../../controllers/users/helpers')

const createLocalAdmin = async (req, res) => {
  try {
    const args = {
      name: process.env.ADMIN_NAME,
      email: process.env.EMAIL_FROM_ADDRESS,
      password: process.env.ADMIN_PASSWORD,
      address: process.env.ADMIN_ADDRESS,
      role: 'admin'
    }
    const doesEmailExists = await emailExists(args.email)
    if (!doesEmailExists) {
      const item = await createItemInDb(args)
      res.status(201).json(item)
    }
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { createLocalAdmin }
