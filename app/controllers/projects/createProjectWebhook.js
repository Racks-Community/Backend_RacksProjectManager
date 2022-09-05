const Project = require('../../models/project')
const PendingProject = require('../../models/pendingProject')
const { createItem } = require('../../middleware/db')
const { handleError } = require('../../middleware/utils')
const { getItemSearch, deleteItemSearch } = require('../../middleware/db')
const { matchedData } = require('express-validator')
const { projectExistsByName, projectExistsByAddress } = require('./helpers')
const { createRepository } = require('../../middleware/auth/githubManager')
const { createChannels } = require('../../middleware/auth/discordManager')
/**
 * Create item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const createProjectWebhook = async (req, res) => {
  try {
    req = matchedData(req)

    const doesProjectExistsName = await projectExistsByName(req.newProjectName)
    const doesProjectExistsAddress = await projectExistsByAddress(
      req.newProjectAddress
    )
    if (!doesProjectExistsName && !doesProjectExistsAddress) {
      let pendingProject = (
        await getItemSearch({ name: req.newProjectName }, PendingProject)
      )[0]
      const newProject = {
        name: pendingProject.name,
        description: pendingProject.description,
        reputationLevel: pendingProject.reputationLevel,
        colateralCost: pendingProject.colateralCost,
        maxContributorsNumber: pendingProject.maxContributorsNumber,
        address: req.newProjectAddress
      }
      saveRes = await createItem(newProject, Project)
      if (saveRes) {
        await deleteItemSearch({ name: req.newProjectName }, PendingProject)
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
    }

    return res.status(200).json(true)
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { createProjectWebhook }
