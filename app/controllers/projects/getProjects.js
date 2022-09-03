const Project = require('../../models/project')
const { checkQueryString, getItems } = require('../../middleware/db')
const { handleError } = require('../../middleware/utils')
const ethers = require('ethers')
const { contractAddresses, RacksPmAbi } = require('../../../web3Constants')

/**
 * Get items function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const getProjects = async (req, res) => {
  try {
    const query = await checkQueryString(req.query)

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

    let racksPMSigner = racksPM.connect(wallet)
    let projectsAddresses = await racksPMSigner.getProjects()
    let projects = await getItems(req, Project, query)
    projects = projects.docs.filter((project) =>
      projectsAddresses.includes(project.address)
    )
    res.status(200).json(projects)
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { getProjects }
