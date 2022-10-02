const Project = require('../../models/project')
const User = require('../../models/user')
const { handleError } = require('../../middleware/utils')
const { matchedData } = require('express-validator')
const { getItemSearch } = require('../../middleware/db')
const {
  removeRepositoryContributor
} = require('../../middleware/auth/githubManager')
const {
  removeRolesFromMember
} = require('../../middleware/auth/discordManager')
const { projectExistsByAddress } = require('./helpers')
const { ProjectAbi } = require('../../../web3Constants')
const ethers = require('ethers')

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

    let tx = await projectSigner.removeContributor(req.contributorAddress, true)
    await tx.wait()

    const isProjectContributor = await projectContract.isContributorInProject(
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
        contributor.totalProjects--
        await contributor.save()
        const resData = await projectModel.save()
        if (process.env.DISCORD_BOT_TOKEN != 'void') {
          await removeRolesFromMember(projectModel.name, contributor.discord)
        }
        // if (process.env.GITHUB_ACCESS_TOKEN != 'void') {
        //   await removeRepositoryContributor(
        //     projectModel.name,
        //     contributor.githubUsername
        //   )
        // }
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
