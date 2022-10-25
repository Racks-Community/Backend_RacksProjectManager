const Project = require('../../models/project')
const { handleError } = require('../../middleware/utils')
const { matchedData } = require('express-validator')
const { getItemSearch } = require('../../middleware/db')
const { ProjectAbi } = require('../../../web3Constants')
const ethers = require('ethers')

/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const fundProjectWebhook = async (req, res) => {
  try {
    req = matchedData(req)

    const provider = new ethers.providers.JsonRpcProvider(
      process.env.RPC_PROVIDER
    )
    const projectContract = new ethers.Contract(
      req.address,
      ProjectAbi,
      provider
    )

    const projectFunds = parseInt(
      ethers.utils.formatEther(await projectContract.getTotalAmountFunded())
    )
    let projectModel = (
      await getItemSearch({ address: req.address }, Project)
    )[0]
    const currentFunds = projectModel.funds

    if (currentFunds + parseInt(req.amount) == projectFunds) {
      try {
        projectModel.funds = projectFunds
        const resData = await projectModel.save()
        res.status(200).json(resData)
      } catch (error) {
        handleError(res, error)
      }
    }
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { fundProjectWebhook }
