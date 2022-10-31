const { Octokit } = require('octokit')
const fetch = require('node-fetch')

const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN
})

const createRepository = (name) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!name) {
        return reject(null)
      }
      name = formatName(name)
      const homepage =
        'https://github.com/' + process.env.GITHUB_ORGANIZATION + '/' + name
      const response = await octokit.request('POST /orgs/{org}/repos', {
        org: process.env.GITHUB_ORGANIZATION,
        name: name,
        description: 'Racks Community Project',
        homepage: homepage,
        private: true,
        has_issues: false,
        has_projects: false,
        has_wiki: false
      })
      resolve(homepage)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

const addRepositoryContributor = (name, username) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!name || !username) {
        return reject(null)
      }
      name = formatName(name)
      await octokit.request(
        'PUT /repos/{owner}/{repo}/collaborators/{username}',
        {
          owner: process.env.GITHUB_ORGANIZATION,
          repo: name,
          username: username,
          permission: 'push'
        }
      )

      resolve()
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

const removeRepositoryContributor = (name, username) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!name || !username) {
        return reject(null)
      }
      name = formatName(name)
      await octokit.request(
        'DELETE /repos/{owner}/{repo}/collaborators/{username}',
        {
          owner: process.env.GITHUB_ORGANIZATION,
          repo: name,
          username: username
        }
      )

      resolve()
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

const addOrganizationContributor = (username, email) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!username || !email) {
        return reject(null)
      }

      const orgs = await octokit.request('GET /users/{username}/orgs', {
        username: username
      })
      let isInOrg = false
      for (let org of orgs.data) {
        if (org.login === process.env.GITHUB_ORGANIZATION) isInOrg = true
      }

      if (!isInOrg) {
        await octokit.request('POST /orgs/{org}/invitations', {
          org: process.env.GITHUB_ORGANIZATION,
          email: email,
          role: 'direct_member'
        })
      }
      resolve()
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

const blockOrganizationContributor = (username) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!username) {
        return reject(null)
      }
      await octokit.request('PUT /orgs/{org}/blocks/{username}', {
        org: process.env.GITHUB_ORGANIZATION,
        username: username
      })

      resolve()
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

const unblockOrganizationContributor = (username) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!username) {
        return reject(null)
      }
      await octokit.request('DELETE /orgs/{org}/blocks/{username}', {
        org: process.env.GITHUB_ORGANIZATION,
        username: username
      })

      resolve()
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

const deleteRepository = (name) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!name) {
        return reject(null)
      }
      name = formatName(name)
      const res = await fetch(
        'https://api.github.com/repos/' +
          process.env.GITHUB_ORGANIZATION +
          '/' +
          name,
        {
          method: 'DELETE',
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: 'Bearer ' + process.env.GITHUB_ACCESS_TOKEN
          }
        }
      )
      if (res?.ok) {
        resolve()
      }
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

// const deleteRepositoryOctokit = (name) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       if (!name) {
//         return reject(null)
//       }
//       name = formatName(name)
//       await octokit.request('DELETE /repos/{owner}/{repo}', {
//         owner: process.env.GITHUB_ORGANIZATION,
//         repo: name
//       })

//       resolve()
//     } catch (error) {
//       console.log(error)
//       reject(error)
//     }
//   })
// }

const getContributorsParticipation = (name) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!name) {
        return reject(null)
      }
      const MID_DIFFICULTY = '[mid]'
      const HIGH_DIFFICULTY = '[high]'
      name = formatName(name)
      const commits = await octokit.request(
        'GET /repos/{owner}/{repo}/commits',
        {
          owner: process.env.GITHUB_ORGANIZATION,
          repo: name
        }
      )
      let participation = new Map()
      let totalPoints = 0
      for (const commit of commits.data) {
        const contributor = commit.author.login
        const message = commit.commit.message
        const weight = 1

        if (message.includes(HIGH_DIFFICULTY)) weight = 6
        else if (message.includes(MID_DIFFICULTY)) weight = 3

        if (!participation.get(contributor)) {
          participation.set(contributor, weight)
        } else {
          participation.set(
            contributor,
            participation.get(contributor) + weight
          )
        }
        totalPoints += weight
      }

      let participations = []
      for (let [key, value] of participation) {
        const contribution = {
          name: key,
          participation: (value * 100) / totalPoints
        }
        participations.push(contribution)
      }

      resolve(participations)
    } catch (error) {
      if (
        error.status == '409' &&
        error.response.data.message == 'Git Repository is empty.'
      )
        resolve(null)
      else reject(error)
    }
  })
}

const formatName = (name) => {
  if (!name) return null
  return name.replace(/\s+/g, '-').toLowerCase()
}

module.exports = {
  createRepository,
  addRepositoryContributor,
  addOrganizationContributor,
  deleteRepository,
  removeRepositoryContributor,
  getContributorsParticipation,
  blockOrganizationContributor,
  unblockOrganizationContributor
}
