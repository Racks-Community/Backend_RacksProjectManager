const express = require('express')
const router = express.Router()
require('../../config/passport')
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', {
  session: false
})
const trimRequest = require('trim-request')

const { roleAuthorization } = require('../controllers/auth')

const controller = require('../controllers/upload/upload')

/*
 * Create new item route
 */
router.post(
  '/postimg',
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  controller.upload.single('file'),
  controller.PostImg
)

module.exports = router
