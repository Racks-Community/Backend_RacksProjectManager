const express = require('express')
const router = express.Router()
require('../../config/passport')
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', {
  session: false
})
const trimRequest = require('trim-request')

const {
  login,
  register,
  forgotPassword,
  resetPassword,
  verify,
  getRefreshToken,
  roleAuthorization,
  nonce,
  loginNft
} = require('../controllers/auth')

const {
  validateRegister,
  validateForgotPassword,
  validateResetPassword,
  validateLogin,
  validateVerify,
  validateLoginNft
} = require('../controllers/auth/validators')

const { mintTest } = require('../middleware/auth/mintTest')

const { createLocalAdmin } = require('../middleware/auth/createLocalAdmin')

const { validateHolder } = require('../middleware/auth/validateHolder')

/*
 * Auth routes
 */

/*
 * Register route
 */
router.post('/register', trimRequest.all, validateRegister, register)

/*
 * Forgot password route
 */
// router.post('/forgot', trimRequest.all, validateForgotPassword, forgotPassword)

/*
 * Reset password route
 */
// router.post('/reset', trimRequest.all, validateResetPassword, resetPassword)

/*
 * Login route
 */
router.post('/login', trimRequest.all, validateLogin, login)

/*
 * Get new refresh token
 */

router.get(
  '/token',
  requireAuth,
  roleAuthorization(['user', 'admin']),
  trimRequest.all,
  getRefreshToken
)
/*
 * Verify route
 */
router.post('/verify', trimRequest.all, validateVerify, verify)

router.post('/loginnft', trimRequest.all, validateLoginNft, loginNft)

router.get('/validateholder', trimRequest.all, validateHolder)

router.post('/create-local-admin', trimRequest.all, createLocalAdmin)

router.get('/mintTest', trimRequest.all, mintTest)

router.get('/nonce', trimRequest.all, nonce)

module.exports = router
