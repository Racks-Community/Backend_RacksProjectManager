// const axios = require('axios').default
const fetch = require('node-fetch')
const ethers = require('ethers')
const { contractAddresses, RacksPmAbi } = require('./web3Constants')
require('dotenv-safe').config()

const startEventManager = async () => {
  try {
    const CONTRACT_ADDRESS =
      process.env.CHAIN_ID in contractAddresses
        ? contractAddresses[process.env.CHAIN_ID]
        : null
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.RPC_PROVIDER
    )
    const racksPM = new ethers.Contract(
      CONTRACT_ADDRESS.RacksProjectManager[0],
      RacksPmAbi,
      provider
    )

    const loginData = {
      email: process.env.EMAIL_FROM_ADDRESS,
      password: process.env.ADMIN_PASSWORD
    }

    racksPM.on(
      'newProjectCreated',
      async (newProjectName, newProjectAddress) => {
        let token = ''
        const res = await fetch(process.env.API_URL + 'login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(loginData)
        })

        if (res?.ok) {
          const data = await res.json()
          token = data.token
        } else {
          console.log('Login error')
          process.exit(1)
        }

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
    )

    racksPM.on('newContributorRegistered', async (newContributorAddress) => {
      let token = ''
      const res = await fetch(process.env.API_URL + 'login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      })

      if (res?.ok) {
        const data = await res.json()
        token = data.token
      } else {
        console.log('Login error')
        process.exit(1)
      }

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
    })
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

startEventManager()
