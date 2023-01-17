const User = require('../../models/user')
const { handleError } = require('../../middleware/utils')
const { matchedData } = require('express-validator')
const { getItemSearch } = require('../../middleware/db')
const ethers = require('ethers')
const {
  modifyContributorRP,
  getContributorDataByAddress
} = require('../../middleware/external/contractCalls')

/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const modifyContributorReputation = async (req, res) => {
  try {
    req = matchedData(req)

    const tx = await modifyContributorRP(
      req.address,
      req.points,
      req.add === 'true'
    )

    if (tx) {
      let contributor = (await getItemSearch({ address: req.address }, User))[0]
      const contributorOnChain = await getContributorDataByAddress(
        contributor.address
      )
      contributor.reputationLevel = ethers.BigNumber.from(
        contributorOnChain.reputationLevel
      ).toNumber()
      contributor.reputationPoints = ethers.BigNumber.from(
        contributorOnChain.reputationPoints
      ).toNumber()
      await contributor.save()

      res.status(200).json(contributor)
    } else {
      res.status(500).json('No Completed')
    }
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { modifyContributorReputation }
