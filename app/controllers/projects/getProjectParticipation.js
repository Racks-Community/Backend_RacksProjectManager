const Project = require('../../models/project')
const User = require('../../models/user')
const { handleError } = require('../../middleware/utils')
const { matchedData } = require('express-validator')
const { getItemSearch } = require('../../middleware/db')
const {
  getContributorsParticipation
} = require('../../middleware/auth/githubManager')
const { projectExistsByAddress } = require('./helpers')

/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const getProjectParticipation = async (req, res) => {
  try {
    req = matchedData(req)
    const doesProjectExists = await projectExistsByAddress(req.address)
    if (!doesProjectExists) {
      return res.status(404).send(false)
    }

    let participations = []
    let project = (await getItemSearch({ address: req.address }, Project))[0]

    if (process.env.GITHUB_ACCESS_TOKEN != 'void') {
      participations = await getContributorsParticipation(project.name)
    }
    if (!participations)
      return res.status(409).send('Project repository is empty.')

    let contrParticipations = []
    for (let [i, contribution] of participations.entries()) {
      let contributor = (
        await getItemSearch(
          { githubUsername: contribution.name.toLowerCase() },
          User
        )
      )[0]
      if (contributor) {
        let contr = contribution
        contr.address = contributor.address
        contr.participation = Math.trunc(contribution.participation)
        contrParticipations.push(contr)
      }
    }

    return res.status(200).json(contrParticipations)
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { getProjectParticipation }
