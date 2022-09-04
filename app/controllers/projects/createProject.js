const Project = require('../../models/project')
const PendingProject = require('../../models/pendingProject')
const { createItem } = require('../../middleware/db')
const ethers = require('ethers')
const { handleError } = require('../../middleware/utils')
const { getItemSearch, deleteItemSearch } = require('../../middleware/db')
const { matchedData } = require('express-validator')
const { projectExistsByName, projectExistsByAddress } = require('./helpers')
const { contractAddresses, RacksPmAbi } = require('../../../web3Constants')
const { createRepository } = require('../../middleware/auth/githubManager')
const { createChannels } = require('../../middleware/auth/discordManager')
const { removeListener } = require('../../models/project')
const { Linter } = require('eslint')
/**
 * Create item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const createProject = async (req, res) => {
  try {
    req = matchedData(req)
    let saveRes = null

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

      await createItem(req, PendingProject)

      let tx = await racksPMSigner.createProject(
        req.name,
        req.colateralCost,
        req.reputationLevel,
        req.maxContributorsNumber
      )
      await tx.wait()
      racksPM.on(
        'newProjectCreated',
        async (newProjectName, newProjectAddress) => {
          try {
            const doesProjectExistsName = await projectExistsByName(
              newProjectName
            )
            const doesProjectExistsAddress = await projectExistsByAddress(
              newProjectAddress
            )
            if (!doesProjectExistsName && !doesProjectExistsAddress) {
              try {
                let pendingProject = (
                  await getItemSearch({ name: newProjectName }, PendingProject)
                )[0]
                const newProject = {
                  name: pendingProject.name,
                  description: pendingProject.description,
                  reputationLevel: pendingProject.reputationLevel,
                  colateralCost: pendingProject.colateralCost,
                  maxContributorsNumber: pendingProject.maxContributorsNumber,
                  address: newProjectAddress
                }
                saveRes = await createItem(newProject, Project)
                if (saveRes) {
                  await deleteItemSearch(
                    { name: newProjectName },
                    PendingProject
                  )
                }
                if (process.env.GITHUB_ACCESS_TOKEN != 'void') {
                  req.githubRepository = await createRepository(
                    pendingProject.name,
                    pendingProject.description
                  )
                }
                if (process.env.DISCORD_BOT_TOKEN != 'void') {
                  await createChannels(pendingProject.name)
                }
                racksPM.removeAllListeners()
              } catch (error) {
                handleError(res, error)
              }
            } else {
              await deleteItemSearch({ name: newProjectName }, PendingProject)
            }
          } catch (error) {
            handleError(res, error)
          }
        }
      )
      return res.send()
    }
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { createProject }
