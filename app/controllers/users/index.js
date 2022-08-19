const { createUser } = require('./createUser')
const { deleteUser } = require('./deleteUser')
const { getUser } = require('./getUser')
const { getUsers } = require('./getUsers')
const { updateUser } = require('./updateUser')
const { updateUserToContributor } = require('./updateUserToContributor')

module.exports = {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
  updateUserToContributor
}
