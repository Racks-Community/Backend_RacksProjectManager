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
const banContributor = async (req, res) => {
  try {
    req = matchedData(req)
    const isHolder = await validateHolderInternal(req.address)
    if (isHolder < 1)
      return res.status(404).json({ message: 'you need at least 1 token' })

    const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY

    const CONTRACT_ADDRESS =
      process.env.CHAIN_ID in contractAddresses
        ? contractAddresses[process.env.CHAIN_ID]
        : null
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.RINKEBY_PROVIDER
    )
    let wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider)

    const racksPM = new ethers.Contract(
      CONTRACT_ADDRESS.RacksProjectManager[0],
      RacksPmAbi,
      provider
    )
    let bannedState = req.banned === 'true'
    const isContributor = await racksPM.isWalletContributor(req.address)
    if (isContributor) {
      try {
        let racksPMSigner = racksPM.connect(wallet)
        let tx = await racksPMSigner.setContributorStateToBanList(
          req.address,
          bannedState
        )
        await tx.wait()

        const isBanned = await racksPM.isContributorBanned(req.address)
        if (isBanned == bannedState) {
          res
            .status(200)
            .json(await updateItemSearch({ address: req.address }, User, req))
        }
      } catch (error) {
        handleError(res, error)
      }
    }
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { banContributor }
