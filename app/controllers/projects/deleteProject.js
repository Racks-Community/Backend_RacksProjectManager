const Project = require('../../models/project')
const { matchedData } = require('express-validator')
const { isIDGood, handleError } = require('../../middleware/utils')
const { deleteItemSearch, getItemSearch } = require('../../middleware/db')
const { getUserIdFromToken, findUserById } = require('../auth/helpers')
const { deleteRepository } = require('../../middleware/external/githubManager')
const {
  deleteProjectChannels
} = require('../../middleware/external/discordManager')
const { projectExistsByAddress } = require('./helpers')
const {
  deleteProjectCall,
  projectIsDeleted
} = require('../../middleware/external/contractCalls')

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

    const tx = await deleteProjectCall(req.address)
    let deleteRes = false
    if (tx.hash) {
      const isDeleted = await projectIsDeleted(req.address)
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
