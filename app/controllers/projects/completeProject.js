const Project = require('../../models/project')
const User = require('../../models/user')
const { handleError } = require('../../middleware/utils')
const { matchedData } = require('express-validator')
const { getItemSearch } = require('../../middleware/db')
const {
  addOrganizationContributor
} = require('../../middleware/external/githubManager')
const { projectExistsByAddress } = require('./helpers')
const { ProjectAbi } = require('../../../web3Constants')
const ethers = require('ethers')
const { getUserFromId } = require('../users/getUserFromId')
const {
  projectIsFinished,
  finishProject,
  ProjectGetContributorByAddress
} = require('../../middleware/external/contractCalls')

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

    let completed = await projectIsFinished(req.address)

    if (!completed) {
      await finishProject(
        req.address,
        Number(req.totalReputationPointsReward),
        req.contributorParticipation
      )
      completed = await projectIsFinished(req.address)
    }
    if (completed) {
      let projectModel = (
        await getItemSearch({ address: req.address }, Project)
      )[0]
      let participationWeights = []
      projectModel.completed = true
      projectModel.status = 'FINISHED'
      projectModel.completedAt = new Date()
      for (let contrWallet of projectModel.contributors) {
        let contributor = (
          await getItemSearch({ _id: contrWallet + '' }, User)
        )[0]
        const contributorOnChain = await ProjectGetContributorByAddress(
          req.address,
          contributor.address
        )
        contributor.reputationLevel = ethers.BigNumber.from(
          contributorOnChain.reputationLevel
        ).toNumber()
        contributor.reputationPoints = ethers.BigNumber.from(
          contributorOnChain.reputationPoints
        ).toNumber()
        contributor.totalProjects++
        participationWeights.push(
          req.contributorParticipation[
            projectModel.contributors.indexOf(contrWallet)
          ].participation
        )
        await contributor.save()
      }
      projectModel.participationWeights = participationWeights
      await projectModel.save()
      res.status(200).json(true)
    } else {
      res.status(500).json('No Completed')
    }
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { completeProject }
