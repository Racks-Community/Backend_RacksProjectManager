const PendingProject = require('../../models/pendingProject')
const { createItem, deleteItemSearch } = require('../../middleware/db')
const { isIDGood, handleError } = require('../../middleware/utils')
const { projectExistsByName } = require('./helpers')
const { getUserIdFromToken, findUserById } = require('../auth/helpers')
const ethers = require('ethers')
const { createProjectCall } = require('../../middleware/external/contractCalls')
/**
 * Create item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const createProject = async (req, res) => {
  try {
    const doesProjectExists = await projectExistsByName(req.body.name)
    if (doesProjectExists) {
      return res.status(409).send(false)
    }
    const tokenEncrypted = req.headers.authorization
      .replace('Bearer ', '')
      .trim()

    if (req.file)
      req.body.imageURL = process.env.API_URL + 'uploads/' + req.file.filename

    let userId = await getUserIdFromToken(tokenEncrypted)
    userId = await isIDGood(userId)
    const user = await findUserById(userId)
    if (user.role === 'admin') req.body.approveStatus = 'ACTIVE'
    await createItem(req.body, PendingProject)

    await createProjectCall(
      req.body.name,
      ethers.utils.parseEther(req.body.colateralCost + ''),
      req.body.reputationLevel,
      req.body.maxContributorsNumber
    )
    return res.status(200).json(true)
  } catch (error) {
    await deleteItemSearch({ name: req.body.name }, PendingProject)
    handleError(res, error)
  }
}

module.exports = { createProject }
