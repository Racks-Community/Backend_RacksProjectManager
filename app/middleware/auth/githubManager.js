const { Octokit } = require('octokit')

const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN
})

const createRepository = (name, description) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!name || !description) {
        return reject(null)
      }
      name = formatName(name)
      const homepage =
        'https://github.com/' + process.env.GITHUB_ORGANIZATION + '/' + name
      const response = await octokit.request('POST /orgs/{org}/repos', {
        org: process.env.GITHUB_ORGANIZATION,
        name: name,
        description: description,
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

const formatName = (name) => {
  if (!name) return null
  return name.replace(/\s+/g, '-').toLowerCase()
}

module.exports = {
  createRepository,
  addRepositoryContributor,
  addOrganizationContributor
}
