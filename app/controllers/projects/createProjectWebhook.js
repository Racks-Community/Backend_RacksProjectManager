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
        owner: pendingProject.owner,
        imageURL: pendingProject.imageURL,
        address: req.newProjectAddress
      }
      if (pendingProject.requirements) {
        newProject.requirements = pendingProject.requirements
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
      await deleteItemSearch({ name: req.newProjectName }, PendingProject)
      saveRes = await createItem(newProject, Project)
    }

    return res.status(200).json(saveRes)
  } catch (error) {
    await deleteItemSearch({ name: req.newProjectName }, PendingProject)
    handleError(res, error)
  }
}

module.exports = { createProjectWebhook }
