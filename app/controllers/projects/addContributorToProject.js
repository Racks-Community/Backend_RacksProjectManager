const Project = require('../../models/project')
const User = require('../../models/user')
const { handleError } = require('../../middleware/utils')
const { matchedData } = require('express-validator')
const { getItemSearch } = require('../../middleware/db')
const {
  addRepositoryContributor
} = require('../../middleware/external/githubManager')
const {
  grantRolesToMember
} = require('../../middleware/external/discordManager')
const { ProjectAbi } = require('../../../web3Constants')
const ethers = require('ethers')
const {
  isContributorInProject
} = require('../../middleware/external/contractCalls')

/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const addContributorToProject = async (req, res) => {
  try {
    req = matchedData(req)

    const isProjectContributor = await isContributorInProject(
      req.address,
      req.contributorAddress
    )
    if (isProjectContributor) {
      try {
        let projectModel = (
          await getItemSearch({ address: req.address }, Project)
        )[0]
        let contributor = (
          await getItemSearch({ address: req.contributorAddress }, User)
        )[0]

        if (!contributor.verified || projectModel.approveStatus != 'ACTIVE') {
          return res.status(500).send()
        }

        await contributor.save()
        projectModel.contributors.push(contributor)
        projectModel.status = 'DOING'
        const resData = await projectModel.save()
        if (process.env.DISCORD_BOT_TOKEN != 'void') {
          await grantRolesToMember(projectModel.name, contributor.discord)
        }
        if (
          process.env.GITHUB_ACCESS_TOKEN != 'void' &&
          projectModel.isProgramming
        ) {
          await addRepositoryContributor(
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

module.exports = { addContributorToProject }
