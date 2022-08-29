const Project = require('../../models/project')
const User = require('../../models/user')
const { isIDGood, handleError } = require('../../middleware/utils')
const { matchedData } = require('express-validator')
const { getItemSearch } = require('../../middleware/db')
const { getUserIdFromToken, findUserById } = require('../auth/helpers')
const {
  addRepositoryContributor
} = require('../../middleware/auth/githubManager')
const { grantRolesToMember } = require('../../middleware/auth/discordManager')
const {
  contractAddresses,
  RacksPmAbi,
  MockErc20Abi,
  ProjectAbi
} = require('../../../web3Constanst')
const ethers = require('ethers')

/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const addContributorToProject = async (req, res) => {
  try {
    const tokenEncrypted = req.headers.authorization
      .replace('Bearer ', '')
      .trim()

    req = matchedData(req)

    const USER_PRIVATE_KEY = process.env.USER_PRIVATE_KEY

    const provider = new ethers.providers.JsonRpcProvider(
      process.env.RINKEBY_PROVIDER
    )

    const CONTRACT_ADDRESS =
      process.env.CHAIN_ID in contractAddresses
        ? contractAddresses[process.env.CHAIN_ID]
        : null

    const racksPM = new ethers.Contract(
      CONTRACT_ADDRESS.RacksProjectManager[0],
      RacksPmAbi,
      provider
    )
    const mockErc20 = new ethers.Contract(
      CONTRACT_ADDRESS.MockErc20[0],
      MockErc20Abi,
      provider
    )
    let wallet = new ethers.Wallet(USER_PRIVATE_KEY, provider)

    let mockErc20Signer = mockErc20.connect(wallet)
    let erctx = await mockErc20Signer.approve(req.address, 500)
    await erctx.wait()

    const project = new ethers.Contract(req.address, ProjectAbi, provider)
    let projectSigner = project.connect(wallet)
    const isContributor = await racksPM.isWalletContributor(
      req.contributorAddress
    )
    if (!isContributor)
      return res.status(404).json({ message: 'you need to be a Contributor' })

    let userId = await getUserIdFromToken(tokenEncrypted)
    userId = await isIDGood(userId)
    const user = await findUserById(userId)
    if (user.address !== req.contributorAddress)
      return res.status(409).json({ message: 'Integrity violation' })

    let tx = await projectSigner.registerProjectContributor()
    await tx.wait()

    project.on(
      'newProjectContributorsRegistered',
      async (newProjectContributorAddress) => {
        const isProjectContributor = await project.walletIsProjectContributor(
          req.contributorAddress
        )
        if (
          newProjectContributorAddress === req.contributorAddress &&
          isProjectContributor
        ) {
          try {
            let projectModel = (
              await getItemSearch({ address: req.address }, Project)
            )[0]
            let contributor = (
              await getItemSearch(
                { address: newProjectContributorAddress },
                User
              )
            )[0]
            contributor.totalProjects++
            await contributor.save()
            projectModel.contributors.push(contributor)
            projectModel.status = 'DOING'
            const resData = await projectModel.save()
            if (process.env.GITHUB_ACCESS_TOKEN != 'void') {
              await addRepositoryContributor(
                projectModel.name,
                contributor.githubUsername
              )
            }
            if (process.env.DISCORD_BOT_TOKEN != 'void') {
              await grantRolesToMember(projectModel.name, contributor.discord)
            }
            res.status(200).json(resData)
          } catch (error) {
            handleError(res, error)
          }
        }
      }
    )
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { addContributorToProject }
