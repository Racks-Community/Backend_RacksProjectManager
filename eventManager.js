const fetch = require('node-fetch')
const {
  getRacksProjectManagerContract
} = require('./app/middleware/external/contractCalls')
require('dotenv-safe').config()

const startEventManager = async () => {
  try {
    const racksPM = await getRacksProjectManagerContract()
    const loginData = {
      email: process.env.EMAIL_FROM_ADDRESS,
      password: process.env.ADMIN_PASSWORD
    }

    const getToken = async () => {
      const res = await fetch(process.env.API_URL + 'login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      })

      if (res?.ok) {
        const data = await res.json()
        return data.token
      } else {
        console.log('Login error')
        return null
      }
    }

    racksPM.on(
      'NewProjectCreated',
      async (newProjectName, newProjectAddress) => {
        const token = await getToken()

        if (token) {
          const projectData = {
            newProjectName,
            newProjectAddress
          }
          await fetch(process.env.API_URL + 'projects/webhook', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: token
            },
            body: JSON.stringify(projectData)
          })
        }
      }
    )

    racksPM.on('NewContributorRegistered', async (newContributorAddress) => {
      const token = await getToken()

      if (token) {
        await fetch(
          process.env.API_URL +
            'users/contributor/webhook/' +
            newContributorAddress,
          {
            method: 'PATCH',
            headers: {
              Authorization: token
            }
          }
        )
      }
    })
  } catch (error) {
    console.log(error)
  }
}

startEventManager()
