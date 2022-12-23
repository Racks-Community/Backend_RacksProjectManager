const Project = require('../../models/project')
const { updateItemSearch, getItemSearch } = require('../../middleware/db')
const { isIDGood, handleError } = require('../../middleware/utils')
const { getUserIdFromToken, findUserById } = require('../auth/helpers')
const ethers = require('ethers')
const {
  getProjectContract,
  getAdminWallet
} = require('../../middleware/external/contractCalls')

/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const updateProject = async (req, res) => {
  try {
    const tokenEncrypted = req.headers.authorization
      .replace('Bearer ', '')
      .trim()

    let project = (
      await getItemSearch({ address: req.params.address }, Project)
    )[0]
    let userId = await getUserIdFromToken(tokenEncrypted)
    userId = await isIDGood(userId)
    const user = await findUserById(userId)
    if (user.id !== project.owner + '' && user.role != 'admin')
      return res
        .status(409)
        .send('Integrity Conflict. User is not the Owner or Admin')

    const projectContract = await getProjectContract(req.params.address)
    const wallet = await getAdminWallet()
    let projectSigner = projectContract.connect(wallet)
    try {
      if (req.body.reputationLevel) {
        let tx = await projectSigner.setReputationLevel(
          req.body.reputationLevel
        )
        await tx.wait()
      }

      if (req.body.colateralCost) {
        let tx = await projectSigner.setColateralCost(
          ethers.utils.parseEther(req.body.colateralCost + '')
        )
        await tx.wait()
      }

      if (req.body.maxContributorsNumber) {
        let tx = await projectSigner.setMaxContributorsNumber(
          req.body.maxContributorsNumber
        )
        await tx.wait()
      }
      if (req.file)
        req.body.imageURL = process.env.API_URL + 'uploads/' + req.file.filename
      res
        .status(200)
        .json(
          await updateItemSearch(
            { address: req.params.address },
            Project,
            req.body
          )
        )
    } catch (error) {
      handleError(res, error)
    }
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { updateProject }
