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
  deleteProject
} = require('../controllers/projects')

const {
  validateCreateProject,
  validateGetProject,
  validateUpdateProject,
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
  roleAuthorization(['user', 'admin']),
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
  '/:id',
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  validateGetProject,
  getProject
)

/*
 * Update item route
 */
router.patch(
  '/:id',
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  validateUpdateProject,
  updateProject
)

/*
 * Delete item route
 */
router.delete(
  '/:id',
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  validateDeleteProject,
  deleteProject
)

module.exports = router
