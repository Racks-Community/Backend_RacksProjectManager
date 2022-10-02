const Project = require('../../models/project')
const User = require('../../models/user')
const { handleError } = require('../../middleware/utils')
const { matchedData } = require('express-validator')
const { getItemSearch } = require('../../middleware/db')
const {
  addOrganizationContributor
} = require('../../middleware/auth/githubManager')
const { projectExistsByAddress } = require('./helpers')
const { ProjectAbi } = require('../../../web3Constants')
const ethers = require('ethers')

/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const completeProject = async (req, res) => {
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

    let tx = await projectSigner.finishProject(
      req.totalReputationPointsReward,
      req.contributors,
      req.participationWeights
    )
    await tx.wait()

    const completed = await project.isCompleted()
    if (completed) {
      let projectModel = (
        await getItemSearch({ address: req.address }, Project)
      )[0]
      projectModel.completed = true
      projectModel.status = 'FINISHED'
      const numContributors = await project.getContributorsNumber()
      for (let i = 0; i < numContributors; i++) {
        const contributorOnChain = await project.getProjectContributor(i)
        let contributor = (
          await getItemSearch({ address: contributorOnChain.wallet }, User)
        )[0]
        contributor.reputationLevel = ethers.BigNumber.from(
          contributorOnChain.reputationLevel
        ).toNumber()
        contributor.reputationPoints = ethers.BigNumber.from(
          contributorOnChain.reputationPoints
        ).toNumber()
        await contributor.save()
        await projectModel.save()
        if (process.env.GITHUB_ACCESS_TOKEN != 'void') {
          await addOrganizationContributor(
            contributor.githubUsername,
            contributor.email
          )
        }
      }
      res.status(200).json(true)
    } else {
      res.status(500).json('No Completed')
    }
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { completeProject }
