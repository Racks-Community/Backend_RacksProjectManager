const User = require('../../models/user')
const { matchedData } = require('express-validator')
const { handleError } = require('../../middleware/utils')
const { updateItemSearch } = require('../../middleware/db')
const { validateHolderInternal } = require('../../middleware/auth')
const { contractAddresses, RacksPmAbi } = require('../../../web3Constanst')
const ethers = require('ethers')

/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const updateUserToContributor = async (req, res) => {
  try {
    req = matchedData(req)
    const isHolder = await validateHolderInternal(req.address)
    if (isHolder < 1)
      return res.status(404).json({ message: 'you need at least 1 token' })

    const CONTRACT_ADDRESS =
      process.env.CHAIN_ID in contractAddresses
        ? contractAddresses[process.env.CHAIN_ID]
        : null
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.RINKEBY_PROVIDER
    )

    const racksPM = new ethers.Contract(
      CONTRACT_ADDRESS.RacksProjectManager[0],
      RacksPmAbi,
      provider
    )

    racksPM.on('newContributorRegistered', async (newContributorAddress) => {
      if (newContributorAddress === req.address) {
        try {
          req.contributor = true
          res
            .status(200)
            .json(await updateItemSearch({ address: req.address }, User, req))
        } catch (error) {
          handleError(res, error)
        }
      }
    })
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { updateUserToContributor }
