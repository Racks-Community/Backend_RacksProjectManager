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
  getUserFromId,
  updateUser,
  updateUserToContributor,
  updateUserToContributorWebhook,
  banContributor,
  deleteUser,
  deletePendingContributor
} = require('../controllers/users')

const {
  validateCreateUser,
  validateGetUser,
  validateGetUserFromId,
  validateUpdateUser,
  validateUpdateUserToContributor,
  validateUpdateUserToContributorWebhook,
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
  roleAuthorization(['admin']),
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
 * Get item from id route
 */
router.get(
  '/id/:id',
  requireAuth,
  roleAuthorization(['user', 'admin']),
  trimRequest.all,
  validateGetUserFromId,
  getUserFromId
)

/*
 * Update item route
 */
router.patch(
  '/:address',
  requireAuth,
  roleAuthorization(['user', 'admin']),
  trimRequest.all,
  validateUpdateUser,
  updateUser
)

/*
 * Upgrade to Contributor
 */
router.post(
  '/contributor/:address',
  requireAuth,
  roleAuthorization(['user', 'admin']),
  trimRequest.all,
  validateUpdateUserToContributor,
  updateUserToContributor
)

/*
 * Upgrade to Contributor webhook endpoint
 */
router.patch(
  '/contributor/webhook/:address',
  requireAuth,
  roleAuthorization(['user', 'admin']),
  trimRequest.all,
  validateUpdateUserToContributorWebhook,
  updateUserToContributorWebhook
)

/*
 * Ban User
 */
router.patch(
  '/ban/:address',
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  validateBanUser,
  banContributor
)

/*
 * Delete item route
 */
router.delete(
  '/:address',
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  validateDeleteUser,
  deleteUser
)

/*
 * Delete Pending Contributor
 */
router.delete(
  '/contributor/:address',
  requireAuth,
  roleAuthorization(['user', 'admin']),
  trimRequest.all,
  validateDeleteUser,
  deletePendingContributor
)

module.exports = router
