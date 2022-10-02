const Project = require('../../models/project')
const User = require('../../models/user')
const { handleError } = require('../../middleware/utils')
const { matchedData } = require('express-validator')
const { getItemSearch } = require('../../middleware/db')
const {
  addRepositoryContributor
} = require('../../middleware/auth/githubManager')
const { grantRolesToMember } = require('../../middleware/auth/discordManager')
const { ProjectAbi } = require('../../../web3Constants')
const ethers = require('ethers')

/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const addContributorToProject = async (req, res) => {
  try {
    req = matchedData(req)

    const provider = new ethers.providers.JsonRpcProvider(
      process.env.RPC_PROVIDER
    )

    const projectContract = new ethers.Contract(
      req.address,
      ProjectAbi,
      provider
    )

    const isProjectContributor = await projectContract.isContributorInProject(
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

        if (!contributor.verified) {
          return res.status(500).send()
        }

        contributor.totalProjects++
        await contributor.save()
        projectModel.contributors.push(contributor)
        projectModel.status = 'DOING'
        const resData = await projectModel.save()
        if (process.env.DISCORD_BOT_TOKEN != 'void') {
          await grantRolesToMember(projectModel.name, contributor.discord)
        }
        if (process.env.GITHUB_ACCESS_TOKEN != 'void') {
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
