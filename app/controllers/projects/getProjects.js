const Project = require('../../models/project')
const { checkQueryString, getItems } = require('../../middleware/db')
const { isIDGood, handleError } = require('../../middleware/utils')
const { getUserIdFromToken, findUserById } = require('../auth/helpers')

/**
 * Get items function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const getProjects = async (req, res) => {
  try {
    const tokenEncrypted = req.headers.authorization
      .replace('Bearer ', '')
      .trim()
    const query = await checkQueryString(req.query)

    let userId = await getUserIdFromToken(tokenEncrypted)
    userId = await isIDGood(userId)
    const user = await findUserById(userId)

    let projects = await getItems(req, Project, query)
    projects = projects.docs
    if (user.role == 'admin') {
      return res.status(200).send(projects)
    } else {
      projects = projects.filter(
        (project) => project.reputationLevel <= user.reputationLevel
      )
      return res.status(200).send(projects)
    }
    res.status(500).send()
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { getProjects }
