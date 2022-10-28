const Project = require('../../models/project')
const { matchedData } = require('express-validator')
const { isIDGood, handleError } = require('../../middleware/utils')
const { deleteItemSearch, getItemSearch } = require('../../middleware/db')
const { getUserIdFromToken, findUserById } = require('../auth/helpers')
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
    const tokenEncrypted = req.headers.authorization
      .replace('Bearer ', '')
      .trim()
    req = matchedData(req)
    let project = (await getItemSearch({ address: req.address }, Project))[0]
    let userId = await getUserIdFromToken(tokenEncrypted)
    userId = await isIDGood(userId)
    const user = await findUserById(userId)
    if (user.id !== project.owner + '' && user.role != 'admin')
      return res
        .status(409)
        .send('Integrity Conflict. User s not the Owner or Admin')

    const doesProjectExists = await projectExistsByAddress(req.address)
    if (!doesProjectExists) {
      return res.status(404).send(false)
    }

    const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY

    const provider = new ethers.providers.JsonRpcProvider(
      process.env.RPC_PROVIDER
    )
    let wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider)

    const projectContract = new ethers.Contract(
      req.address,
      ProjectAbi,
      provider
    )
    let projectSigner = projectContract.connect(wallet)

    let tx = await projectSigner.deleteProject()
    await tx.wait()

    let deleteRes = false
    if (tx.hash) {
      const isDeleted = await projectContract.isDeleted()
      console.warning(isDeleted, 'isDeleted')
      if (isDeleted) {
        const owner = await findUserById(project.owner + '')
        if (owner.role === 'user') {
          owner.ownedProjects--
          await owner.save()
        }
        deleteRes = await deleteItemSearch({ address: req.address }, Project)

        if (process.env.GITHUB_ACCESS_TOKEN != 'void') {
          if (project.githubRepository) await deleteRepository(project.name)
        }
        if (process.env.DISCORD_BOT_TOKEN != 'void') {
          await deleteProjectChannels(project.name)
        }
      }
    }
    return res.status(200).json(deleteRes)
  } catch (error) {
    console.error(error)
    handleError(res, error)
  }
}

module.exports = { deleteProject }
