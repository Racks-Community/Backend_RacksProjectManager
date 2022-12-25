const Project = require('../../models/project')
const { getItemSearch } = require('../../middleware/db')
const { createRepository } = require('../../middleware/external/githubManager')
const { createChannels } = require('../../middleware/external/discordManager')
const {
  approveProject,
  projectIsActive
} = require('../../middleware/external/contractCalls')

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
        await approveProject(projectAddress)
        const isActive = await projectIsActive(projectAddress)
        if (isActive) {
          projectModel.approveStatus = 'ACTIVE'
          if (
            process.env.GITHUB_ACCESS_TOKEN != 'void' &&
            projectModel.isProgramming
          ) {
            projectModel.githubRepository = await createRepository(
              projectModel.name
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
