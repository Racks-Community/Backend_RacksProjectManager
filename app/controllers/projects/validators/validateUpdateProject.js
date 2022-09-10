const { validateResult } = require('../../../middleware/utils')
const { check } = require('express-validator')

/**
 * Validates update item request
 */
const validateUpdateProject = [
  check('address')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
  check('name').optional(),
  check('description').optional(),
  check('requirements').optional(),
  check('reputationLevel').optional(),
  check('colateralCost').optional(),
  check('maxContributorsNumber').optional(),
  check('githubRepository').optional(),
  (req, res, next) => {
    validateResult(req, res, next)
  }
]

module.exports = { validateUpdateProject }
