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
  getProjects,
  createProject,
  createProjectWebhook,
  getProject,
  updateProject,
  addContributorToProject,
  completeProject,
  deleteProject
} = require('../controllers/projects')

const {
  validateCreateProject,
  validateCreateProjectWebhook,
  validateGetProject,
  validateUpdateProject,
  validateAddContributorToProject,
  validateCompleteProject,
  validateDeleteProject
} = require('../controllers/projects/validators')

/*
 * Projects routes
 */

/*
 * Get items route
 */
router.get(
  '/',
  requireAuth,
  roleAuthorization(['user', 'admin']),
  trimRequest.all,
  getProjects
)

/*
 * Call Contract's CreateProject function
 */
router.post(
  '/',
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  validateCreateProject,
  createProject
)

/*
 * CreateProject webhook endpoint
 */
router.post(
  '/webhook',
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  validateCreateProjectWebhook,
  createProjectWebhook
)

/*
 * Get item route
 */
router.get(
  '/:address',
  requireAuth,
  roleAuthorization(['user', 'admin']),
  trimRequest.all,
  validateGetProject,
  getProject
)

/*
 * Update item route
 */
router.patch(
  '/:address',
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  validateUpdateProject,
  updateProject
)

/*
 * Add Contributor to project
 */
router.post(
  '/add-contributor/:address',
  requireAuth,
  roleAuthorization(['user']),
  trimRequest.all,
  validateAddContributorToProject,
  addContributorToProject
)

/*
 * Add Contributor to project
 */
router.post(
  '/completed/:address',
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  validateCompleteProject,
  completeProject
)

/*
 * Delete item route
 */
router.delete(
  '/:address',
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  validateDeleteProject,
  deleteProject
)

module.exports = router
