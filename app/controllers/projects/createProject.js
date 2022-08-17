const Project = require('../../models/project')
const { createItem } = require('../../middleware/db')
const ethers = require('ethers')
const { handleError } = require('../../middleware/utils')
const { matchedData } = require('express-validator')
const { projectExists } = require('./helpers')
const { contractAddresses, RacksPmAbi } = require('../../../web3Constanst')

/**
 * Create item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const createProject = async (req, res) => {
  try {
    req = matchedData(req)
    const doesProjectExists = await projectExists(req.name)
    if (!doesProjectExists) {
      const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY

      const CONTRACT_ADDRESS =
        process.env.CHAIN_ID in contractAddresses
          ? contractAddresses[process.env.CHAIN_ID]
          : null
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.RINKEBY_PROVIDER
      )
      let wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider)

      const racksPM = new ethers.Contract(
        CONTRACT_ADDRESS.RacksProjectManager[0],
        RacksPmAbi,
        provider
      )

      let racksPMSigner = racksPM.connect(wallet)
      let tx = await racksPMSigner.createProject(
        req.colateralCost,
        req.reputationLevel,
        req.maxContributorsNumber
      )
      await tx.wait()

      racksPM.on('newProjectCreated', async (newProjectAddress) => {
        req.address = newProjectAddress
        res.status(201).json(await createItem(req, Project))
      })
    }
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { createProject }
