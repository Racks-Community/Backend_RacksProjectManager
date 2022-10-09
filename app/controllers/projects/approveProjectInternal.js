const Project = require('../../models/project')
const { getItemSearch } = require('../../middleware/db')
const { createRepository } = require('../../middleware/auth/githubManager')
const { createChannels } = require('../../middleware/auth/discordManager')
const { ProjectAbi } = require('../../../web3Constants')
const ethers = require('ethers')

const approveProjectInternal = async (projectAddress, approve) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!projectAddress) {
        return reject(null)
      }
      let projectModel = (
        await getItemSearch({ address: projectAddress }, Project)
      )[0]
      if (!projectModel) {
        reject(null)
      }
      if (!approve) {
        projectModel.approveStatus = 'REJECTED'
        resolve(await projectModel.save())
      } else {
        const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY
        const provider = new ethers.providers.JsonRpcProvider(
          process.env.RPC_PROVIDER
        )
        let wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider)
        const projectContract = new ethers.Contract(
          projectAddress,
          ProjectAbi,
          provider
        )
        let projectSigner = projectContract.connect(wallet)
        let tx = await projectSigner.approveProject()
        await tx.wait()
        const isActive = await projectContract.isActive()
        if (isActive) {
          projectModel.approveStatus = 'ACTIVE'
          if (process.env.GITHUB_ACCESS_TOKEN != 'void') {
            projectModel.githubRepository = await createRepository(
              projectModel.name,
              projectModel.description
            )
          }
          if (process.env.DISCORD_BOT_TOKEN != 'void') {
            await createChannels(projectModel.name)
          }
          resolve(await projectModel.save())
        }
      }
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = { approveProjectInternal }
