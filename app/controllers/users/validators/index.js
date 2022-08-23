const { validateCreateUser } = require('./validateCreateUser')
const { validateDeleteUser } = require('./validateDeleteUser')
const { validateGetUser } = require('./validateGetUser')
const { validateUpdateUser } = require('./validateUpdateUser')
const {
  validateUpdateUserToContributor
} = require('./validateUpdateUserToContributor')
const { validateBanUser } = require('./validateBanUser')

module.exports = {
  validateCreateUser,
  validateDeleteUser,
  validateGetUser,
  validateUpdateUser,
  validateUpdateUserToContributor,
  validateBanUser
}
