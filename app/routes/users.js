const express = require('express')
const router = express.Router()
require('../../config/passport')
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', {
  session: false
})
const trimRequest = require('trim-request')

const { roleAuthorization } = require('../controllers/auth')

const {
  getUsers,
  createUser,
  getUser,
  updateUser,
  updateUserToContributor,
  deleteUser
} = require('../controllers/users')

const {
  validateCreateUser,
  validateGetUser,
  validateUpdateUser,
  validateDeleteUser,
  validateBanUser
} = require('../controllers/users/validators')

/*
 * Users routes
 */

/*
 * Get items route
 */
router.get(
  '/',
  requireAuth,
  roleAuthorization(['user', 'admin']),
  trimRequest.all,
  getUsers
)

/*
 * Create new item route
 */
router.post(
  '/',
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  validateCreateUser,
  createUser
)

/*
 * Get item route
 */
router.get(
  '/:address',
  requireAuth,
  roleAuthorization(['user', 'admin']),
  trimRequest.all,
  validateGetUser,
  getUser
)

/*
 * Update item route
 */
router.patch(
  '/',
  requireAuth,
  roleAuthorization(['user']),
  trimRequest.all,
  validateUpdateUser,
  updateUser
)

/*
 * Upgrade to Contributor
 */
router.patch(
  '/contributor',
  requireAuth,
  roleAuthorization(['user']),
  trimRequest.all,
  validateUpdateUser,
  updateUserToContributor
)

/*
 * Ban User
 */
router.patch(
  '/ban',
  requireAuth,
  roleAuthorization(['user']),
  trimRequest.all,
  validateBanUser,
  updateUser
)

/*
 * Delete item route
 */
router.delete(
  ':address',
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  validateDeleteUser,
  deleteUser
)

module.exports = router
