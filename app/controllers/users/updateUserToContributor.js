const User = require('../../models/user')
const { matchedData } = require('express-validator')
const { isIDGood, handleError } = require('../../middleware/utils')
const { updateItemSearch } = require('../../middleware/db')
const { validateHolderInternal } = require('../../middleware/auth')
const { getUserIdFromToken, findUserById } = require('../auth/helpers')
const { getInviteLink } = require('../../middleware/auth/discordManager')
const { contractAddresses, RacksPmAbi } = require('../../../web3Constants')
const ethers = require('ethers')

/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const updateUserToContributor = async (req, res) => {
  try {
    const tokenEncrypted = req.headers.authorization
      .replace('Bearer ', '')
      .trim()

    req = matchedData(req)
    const isHolder = await validateHolderInternal(req.address)
    if (isHolder < 1)
      return res.status(404).json({ message: 'you need at least 1 token' })

    let userId = await getUserIdFromToken(tokenEncrypted)
    userId = await isIDGood(userId)
    const user = await findUserById(userId)
    if (user.address !== req.address)
      return res.status(409).json({ message: 'Integrity violation' })

    const USER_PRIVATE_KEY = process.env.USER_PRIVATE_KEY

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
    let wallet = new ethers.Wallet(USER_PRIVATE_KEY, provider)
    let racksPMSigner = racksPM.connect(wallet)

    try {
      let tx = await racksPMSigner.registerContributor()
      await tx.wait()
    } catch (error) {
      handleError(res, error)
    }

    racksPM.on('newContributorRegistered', async (newContributorAddress) => {
      const isContributor = await racksPM.isWalletContributor(req.address)
      if (newContributorAddress === req.address && isContributor) {
        try {
          req.contributor = true
          await updateItemSearch({ address: req.address }, User, req)
          res.status(200).json(await getInviteLink())
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
