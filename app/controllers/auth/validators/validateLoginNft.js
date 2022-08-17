const { validateResult } = require('../../../middleware/utils')
const { check } = require('express-validator')

/**
 * Validates register request
 */
/**
 * Validates login request
 */
const validateLoginNft = [
  check('message').exists(),
  check('signature').exists(),
  (req, res, next) => {
    validateResult(req, res, next)
  }
]

module.exports = { validateLoginNft }
