const { isIDGood, handleError } = require('../../../middleware/utils')
const { getUserIdFromToken } = require('./getUserIdFromToken')
const { findUserById } = require('./findUserById')

const discordInvite = async (req, res) => {
  try {
    const tokenEncrypted = req.headers.authorization
      .replace('Bearer ', '')
      .trim()

    let userId = await getUserIdFromToken(tokenEncrypted)
    userId = await isIDGood(userId)
    const user = await findUserById(userId)
    if (!user.contributor || !user.verified)
      return res.status(500).json({ message: 'No verified Contributor' })

    res.status(200).json(process.env.DISCORD_INVITE_LINK)
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { discordInvite }
