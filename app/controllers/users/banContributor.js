const User = require('../../models/user')
const Project = require('../../models/project')
const { matchedData } = require('express-validator')
const { handleError } = require('../../middleware/utils')
const { getItemSearch, updateItemSearch } = require('../../middleware/db')
const {
  validateHolderInternal,
  isWalletContributor,
  setContributorStateToBanList,
  isContributorBanned
} = require('../../middleware/external/contractCalls')
const { getItemsCustom } = require('../../middleware/db')
const {
  banMemberFromGuild,
  unbanMemberFromGuild
} = require('../../middleware/external/discordManager')
const {
  blockOrganizationContributor,
  unblockOrganizationContributor
} = require('../../middleware/external/githubManager')

/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const banContributor = async (req, res) => {
  try {
    req = matchedData(req)
    const isHolder = await validateHolderInternal(req.address)
    if (!isHolder)
      return res.status(404).json({ message: 'you need at least 1 token' })

    let bannedState = req.banned == true
    const isContributor = await isWalletContributor(req.address)
    if (isContributor) {
      try {
        await setContributorStateToBanList(req.address, bannedState)

        const isBanned = await isContributorBanned(req.address)
        if (isBanned == bannedState) {
          let contributor = (
            await getItemSearch({ address: req.address }, User)
          )[0]

          if (isBanned) {
            let projects = await getItemsCustom(Project)
            if (projects) {
              for (let [index, project] of projects.entries()) {
                const contrIndex = project.contributors.indexOf(contributor._id)
                if (contrIndex > -1) {
                  project.contributors.splice(contrIndex, 1)
                  if (
                    project.contributors.length == 0 &&
                    project.status == 'DOING'
                  )
                    project.status = 'CREATED'
                  await project.save()
                }
              }
            }
          }

          if (process.env.DISCORD_BOT_TOKEN != 'void') {
            if (bannedState) await banMemberFromGuild(contributor.discord)
            else await unbanMemberFromGuild(contributor.discord)
          }
          if (process.env.GITHUB_ACCESS_TOKEN != 'void') {
            if (bannedState)
              await blockOrganizationContributor(contributor.githubUsername)
            else
              await unblockOrganizationContributor(contributor.githubUsername)
          }
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
