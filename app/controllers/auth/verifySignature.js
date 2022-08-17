const { matchedData } = require('express-validator')
const { handleError } = require('../../middleware/utils')
const { siweMessage } = require('siwe')

/**
 * Register function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const nonce = async (req, res) => {
  try {
    const { message, signature } = req.body

    const fields = await siweMessage.validate(signature)

    if (fields.nonce !== req.session.nonce)
      return handleError(res, { code: 400, message: "nonce doesn't match" })

    // guardarsesion
    // responder con mensaje de ok
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { nonce }
