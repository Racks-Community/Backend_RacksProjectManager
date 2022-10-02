const PendingProject = require('../../models/pendingProject')
const { createItem } = require('../../middleware/db')
const ethers = require('ethers')
const { handleError } = require('../../middleware/utils')
const { matchedData } = require('express-validator')
const { projectExistsByName } = require('./helpers')
const { contractAddresses, RacksPmAbi } = require('../../../web3Constants')
/**
 * Create item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const createProject = async (req, res) => {
  try {
    const doesProjectExists = await projectExistsByName(req.body.name)
    if (doesProjectExists) {
      return res.status(409).send(false)
    }
    const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY

    const CONTRACT_ADDRESS =
      process.env.CHAIN_ID in contractAddresses
        ? contractAddresses[process.env.CHAIN_ID]
        : null
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.RPC_PROVIDER
    )
    let wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider)

    const racksPM = new ethers.Contract(
      CONTRACT_ADDRESS.RacksProjectManager[0],
      RacksPmAbi,
      provider
    )
    let racksPMSigner = racksPM.connect(wallet)

    if (req.file)
      req.body.imageURL = process.env.API_URL + 'uploads/' + req.file.filename

    await createItem(req.body, PendingProject)

    let tx = await racksPMSigner.createProject(
      req.body.name,
      req.body.colateralCost,
      req.body.reputationLevel,
      req.body.maxContributorsNumber
    )
    await tx.wait()
    return res.status(200).json(true)
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { createProject }
