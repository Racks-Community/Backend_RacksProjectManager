/**
 * Creates an object with user info
 * @param {Object} req - request object
 */
const setUserInfo = (req = {}) => {
  return new Promise((resolve) => {
    let user = {
      _id: req._id,
      githubUsername: req.githubUsername,
      discord: req.discord,
      role: req.role,
      email: req.email ? req.email : req.address + '@racks.com',
      address: req.address,
      avatar: req.avatar,
      contributor: req.contributor,
      verified: req.verified,
      banned: req.banned,
      reputationLevel: req.reputationLevel,
      reputationPoints: req.reputationPoints,
      totalProjects: req.totalProjects,
      createdAt: req.createdAt
    }
    // Adds verification for testing purposes
    if (process.env.NODE_ENV !== 'production') {
      user = {
        ...user,
        verification: req.verification
      }
    }
    resolve(user)
  })
}

module.exports = { setUserInfo }
