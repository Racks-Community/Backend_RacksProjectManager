const Project = require('../../models/project')
const { updateItemSearch } = require('../../middleware/db')
const { handleError } = require('../../middleware/utils')
const { matchedData } = require('express-validator')
const { ProjectAbi } = require('../../../web3Constants')
const ethers = require('ethers')

/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const updateProject = async (req, res) => {
  try {
    req = matchedData(req)

    const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY

    const provider = new ethers.providers.JsonRpcProvider(
      process.env.RPC_PROVIDER
    )
    let wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider)

    const project = new ethers.Contract(req.address, ProjectAbi, provider)
    let projectSigner = project.connect(wallet)
    try {
      if (req.reputationLevel) {
        let tx = await projectSigner.setReputationLevel(req.reputationLevel)
        await tx.wait()
      }

      if (req.colateralCost) {
        let tx = await projectSigner.setColateralCost(req.colateralCost)
        await tx.wait()
      }

      if (req.maxContributorsNumber) {
        let tx = await projectSigner.setMaxContributorsNumber(
          req.maxContributorsNumber
        )
        await tx.wait()
      }
      res
        .status(200)
        .json(await updateItemSearch({ address: req.address }, Project, req))
    } catch (error) {
      handleError(res, error)
    }
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { updateProject }
