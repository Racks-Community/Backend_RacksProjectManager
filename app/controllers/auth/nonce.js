const { matchedData } = require('express-validator')
const { handleError } = require('../../middleware/utils')
const { generateNonce } = require('siwe')

const {
  saveAddressAccessAndReturnNonce
} = require('./helpers')
/**
 * Register function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const nonce = async (req, res) => {
  try {
    // const locale = req.getLocale();
    let address = req.query.address;
    let nonce = await generateNonce();
    let params = {
      nonce,
      address
    }
    res.status(200).json(await saveAddressAccessAndReturnNonce(params))
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { nonce }
