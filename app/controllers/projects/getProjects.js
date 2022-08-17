const Project = require('../../models/project')
const { checkQueryString, getItems } = require('../../middleware/db')
const { handleError } = require('../../middleware/utils')
const ethers = require('ethers')
const { contractAddresses, RacksPmAbi } = require('../../../web3Constanst')

/**
 * Get items function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const getProjects = async (req, res) => {
  try {
    const query = await checkQueryString(req.query)
    const USER_PRIVATE_KEY = process.env.USER_PRIVATE_KEY
    const CONTRACT_ADDRESS =
      process.env.CHAIN_ID in contractAddresses
        ? contractAddresses[process.env.CHAIN_ID]
        : null
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.RINKEBY_PROVIDER
    )
    let wallet = new ethers.Wallet(USER_PRIVATE_KEY, provider)

    const racksPM = new ethers.Contract(
      CONTRACT_ADDRESS.RacksProjectManager[0],
      RacksPmAbi,
      provider
    )

    let racksPMSigner = racksPM.connect(wallet)
    let projects = await racksPMSigner.getProjects()
    console.log(projects)
    res.status(200).json(await getItems(req, Project, query))
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { getProjects }
