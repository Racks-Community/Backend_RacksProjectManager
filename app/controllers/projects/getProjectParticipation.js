const Project = require('../../models/project')
const User = require('../../models/user')
const { handleError } = require('../../middleware/utils')
const { matchedData } = require('express-validator')
const { getItem, getItemSearch } = require('../../middleware/db')
const {
  getContributorsParticipation
} = require('../../middleware/external/githubManager')
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

    let project = (await getItemSearch({ address: req.address }, Project))[0]

    let contrParticipations = []
    if (!project.isProgramming && project.contributors.length > 0) {
      for (let contr of project.contributors) {
        let contributor = await getItem(contr, User)
        if (contributor) {
          contrParticipations.push({
            name: contributor.discord,
            address: contributor.address,
            participation: 100 / project.contributors.length
          })
        }
      }
      return res.status(200).send(contrParticipations)
    }

    let participations = []
    if (process.env.GITHUB_ACCESS_TOKEN != 'void') {
      participations = await getContributorsParticipation(project.name)
    }
    if (!participations)
      return res.status(409).send('Project repository is empty.')

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
