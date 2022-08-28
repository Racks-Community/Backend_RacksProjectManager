const Project = require('../../models/project')
const { createItem } = require('../../middleware/db')
const ethers = require('ethers')
const { handleError } = require('../../middleware/utils')
const { matchedData } = require('express-validator')
const { projectExistsByName, projectExistsByAddress } = require('./helpers')
const { contractAddresses, RacksPmAbi } = require('../../../web3Constanst')
const { createRepository } = require('../../middleware/auth/githubManager')
const { createChannels } = require('../../middleware/auth/discordManager')
/**
 * Create item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const createProject = async (req, res) => {
  try {
    req = matchedData(req)

    const doesProjectExists = await projectExistsByName(req.name)
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
        const doesProjectExistsName = await projectExistsByName(req.name)
        const doesProjectExistsAddress = await projectExistsByAddress(
          newProjectAddress
        )
        if (!doesProjectExistsName && !doesProjectExistsAddress) {
          try {
            req.address = newProjectAddress
            const saveRes = await createItem(req, Project)
            req.githubRepository = await createRepository(
              req.name,
              req.description
            )
            await createChannels(req.name)
            res.status(201).json(saveRes)
          } catch (error) {
            handleError(res, error)
          }
        }
      })
    }
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { createProject }
