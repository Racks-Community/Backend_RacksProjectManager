const Project = require('../../models/project')
const User = require('../../models/user')
const { handleError } = require('../../middleware/utils')
const { matchedData } = require('express-validator')
const { getItemSearch } = require('../../middleware/db')
const {
  removeRepositoryContributor
} = require('../../middleware/external/githubManager')
const {
  removeRolesFromMember
} = require('../../middleware/external/discordManager')
const { projectExistsByAddress } = require('./helpers')
const {
  projectRemoveContributor,
  isContributorInProject
} = require('../../middleware/external/contractCalls')

/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const removeContributorFromProject = async (req, res) => {
  try {
    req = matchedData(req)
    const doesProjectExists = await projectExistsByAddress(req.address)
    if (!doesProjectExists) {
      return res.status(404).send(false)
    }

    await projectRemoveContributor(req.address, req.contributorAddress)
    const isProjectContributor = await isContributorInProject(
      req.address,
      req.contributorAddress
    )
    if (!isProjectContributor) {
      try {
        let projectModel = (
          await getItemSearch({ address: req.address }, Project)
        )[0]
        let contributor = (
          await getItemSearch({ address: req.contributorAddress }, User)
        )[0]

        const contrIndex = projectModel.contributors.indexOf(contributor._id)
        projectModel.contributors.splice(contrIndex, 1)
        if (projectModel.contributors.length == 0)
          projectModel.status = 'CREATED'
        await contributor.save()
        const resData = await projectModel.save()
        if (process.env.DISCORD_BOT_TOKEN != 'void') {
          await removeRolesFromMember(projectModel.name, contributor.discord)
        }
        if (process.env.GITHUB_ACCESS_TOKEN != 'void') {
          await removeRepositoryContributor(
            projectModel.name,
            contributor.githubUsername
          )
        }
        res.status(200).json(resData)
      } catch (error) {
        handleError(res, error)
      }
    }
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { removeContributorFromProject }
