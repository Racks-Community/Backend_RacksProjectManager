const Project = require('../../models/project')
const PendingProject = require('../../models/pendingProject')
const { createItem } = require('../../middleware/db')
const { handleError } = require('../../middleware/utils')
const { getItemSearch, deleteItemSearch } = require('../../middleware/db')
const { matchedData } = require('express-validator')
const { projectExistsByName, projectExistsByAddress } = require('./helpers')
const { approveProjectInternal } = require('./approveProjectInternal')
const { findUserById } = require('../auth/helpers')
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
      if (pendingProject.details) {
        newProject.details = pendingProject.details
      }
      if (pendingProject.requirements) {
        newProject.requirements = pendingProject.requirements
      }
      if (pendingProject.visibleForAll) {
        newProject.visibleForAll = pendingProject.visibleForAll
      }
      await deleteItemSearch({ name: req.newProjectName }, PendingProject)
      saveRes = await createItem(newProject, Project)

      const user = await findUserById(pendingProject.owner)
      if (user) {
        user.ownedProjects++
        await user.save()
      }

      if (pendingProject.approveStatus === 'ACTIVE') {
        await approveProjectInternal(req.newProjectAddress, true)
      }
    }
    return res.status(200).json(saveRes)
  } catch (error) {
    await deleteItemSearch({ name: req.newProjectName }, PendingProject)
    handleError(res, error)
  }
}

module.exports = { createProjectWebhook }
