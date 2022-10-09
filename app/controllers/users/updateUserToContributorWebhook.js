const User = require('../../models/user')
const PendingContributor = require('../../models/pendingContributor')
const { matchedData } = require('express-validator')
const { handleError } = require('../../middleware/utils')
const {
  updateItemSearch,
  getItemSearch,
  deleteItemSearch
} = require('../../middleware/db')

/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const updateUserToContributorWebhook = async (req, res) => {
  try {
    req = matchedData(req)

    let pendingContributor = await getItemSearch(
      { address: req.address },
      PendingContributor
    )

    if (pendingContributor.length === 0) {
      const newContributor = {
        contributor: true
      }
      res
        .status(200)
        .json(
          await updateItemSearch({ address: req.address }, User, newContributor)
        )
    } else {
      try {
        pendingContributor = pendingContributor[0]
        const newContributor = {
          email: pendingContributor.email,
          discord: pendingContributor.discord,
          githubUsername: pendingContributor.githubUsername.toLowerCase(),
          avatar: pendingContributor.avatar
        }
        if (pendingContributor.urlTwitter) {
          newContributor.urlTwitter = pendingContributor.urlTwitter
        }
        if (pendingContributor.country) {
          newContributor.country = pendingContributor.country
        }

        newContributor.contributor = true
        newContributor.verified = true
        await deleteItemSearch({ address: req.address }, PendingContributor)
        const resUpdate = await updateItemSearch(
          { address: req.address },
          User,
          newContributor
        )
        res.status(200).json(resUpdate)
      } catch (error) {
        await deleteItemSearch({ address: req.address }, PendingContributor)
        handleError(res, error)
      }
    }
  } catch (error) {
    await deleteItemSearch({ address: req.address }, PendingContributor)
    handleError(res, error)
  }
}

module.exports = { updateUserToContributorWebhook }
