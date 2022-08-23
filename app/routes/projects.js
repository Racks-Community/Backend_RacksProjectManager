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
  getAllProjects,
  getProjects,
  createProject,
  getProject,
  updateProject,
  addContributorToProject,
  completeProject,
  deleteProject
} = require('../controllers/projects')

const {
  validateCreateProject,
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
 * Get all items route
 */
router.get('/all', getAllProjects)

/*
 * Get items route
 */
router.get(
  '/',
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  getProjects
)

/*
 * Create new item route
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
