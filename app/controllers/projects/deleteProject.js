const Project = require('../../models/project')
const { matchedData } = require('express-validator')
const { handleError } = require('../../middleware/utils')
const { deleteItemSearch, getItemSearch } = require('../../middleware/db')
const { deleteRepository } = require('../../middleware/auth/githubManager')
const {
  deleteProjectChannels
} = require('../../middleware/auth/discordManager')
const { projectExistsByAddress } = require('./helpers')
const { ProjectAbi } = require('../../../web3Constants')
const ethers = require('ethers')

/**
 * Delete item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const deleteProject = async (req, res) => {
  try {
    req = matchedData(req)

    const doesProjectExists = await projectExistsByAddress(req.address)
    if (!doesProjectExists) {
      return res.status(404).send(false)
    }

    const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY

    const provider = new ethers.providers.JsonRpcProvider(
      process.env.RPC_PROVIDER
    )
    let wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider)

    const project = new ethers.Contract(req.address, ProjectAbi, provider)
    let projectSigner = project.connect(wallet)

    let tx = await projectSigner.deleteProject()
    await tx.wait()

    let deleteRes = false

    if (tx.hash) {
      const isDeleted = await project.getIsDeleted()
      if (isDeleted) {
        let project = (
          await getItemSearch({ address: req.address }, Project)
        )[0]

        deleteRes = await deleteItemSearch({ address: req.address }, Project)

        if (process.env.GITHUB_ACCESS_TOKEN != 'void') {
          await deleteRepository(project.name)
        }
        if (process.env.DISCORD_BOT_TOKEN != 'void') {
          await deleteProjectChannels(project.name)
        }
      }
    }
    return res.status(200).json(deleteRes)
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { deleteProject }
