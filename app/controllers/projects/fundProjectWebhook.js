const Project = require('../../models/project')
const { handleError } = require('../../middleware/utils')
const { matchedData } = require('express-validator')
const { getItemSearch } = require('../../middleware/db')
const {
  projectGetTotalAmountFunded
} = require('../../middleware/external/contractCalls')

/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const fundProjectWebhook = async (req, res) => {
  try {
    req = matchedData(req)

    const projectFunds = await projectGetTotalAmountFunded(req.address)
    let projectModel = (
      await getItemSearch({ address: req.address }, Project)
    )[0]
    const currentFunds = projectModel.funds

    projectModel.funds = projectFunds
    const resData = await projectModel.save()
    res.status(200).json(resData)
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { fundProjectWebhook }
