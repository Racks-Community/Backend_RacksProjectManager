const { handleError } = require('../utils/handleError')
const ethers = require('ethers')
const {
  contractAddresses,
  RacksPmAbi,
  ProjectAbi,
  HolderValidationAbi,
  MrCryptoAbi
} = require('../../../web3Constants')

//////////////////////
//  GET CONTRACTS  //
/////////////////////

const getAdminWallet = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.RPC_PROVIDER
      )
      let wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider)

      resolve(wallet)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

const getRacksProjectManagerContract = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const CONTRACT_ADDRESS =
        process.env.CHAIN_ID in contractAddresses
          ? contractAddresses[process.env.CHAIN_ID]
          : null
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.RPC_PROVIDER
      )

      const racksPM = new ethers.Contract(
        CONTRACT_ADDRESS.RacksProjectManager,
        RacksPmAbi,
        provider
      )

      resolve(racksPM)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

const getProjectContract = (projectAddress) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!projectAddress) {
        return reject(null)
      }
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.RPC_PROVIDER
      )

      const projectContract = new ethers.Contract(
        projectAddress,
        ProjectAbi,
        provider
      )

      resolve(projectContract)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

const getHolderValidationContract = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.RPC_PROVIDER
      )

      const racksPM = await getRacksProjectManagerContract()

      const holderValidationAddress =
        await racksPM.getHolderValidationInterface()

      const holderValidation = new ethers.Contract(
        holderValidationAddress,
        HolderValidationAbi,
        provider
      )
      resolve(holderValidation)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

const getMrCryptoContract = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const CONTRACT_ADDRESS =
        process.env.CHAIN_ID in contractAddresses
          ? contractAddresses[process.env.CHAIN_ID]
          : null
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.RPC_PROVIDER
      )

      const mrCrypto = new ethers.Contract(
        CONTRACT_ADDRESS.MRCRYPTO,
        MrCryptoAbi,
        provider
      )
      resolve(mrCrypto)
    } catch (error) {
      reject(error)
    }
  })
}

//////////////////////
//  CONTRACT CALLS  //
/////////////////////

// RACKS PROJECT MANAGER

const isWalletContributor = (contributorAddress) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!contributorAddress) {
        return reject(null)
      }
      const racksPM = await getRacksProjectManagerContract()
      const isContributor = await racksPM.isWalletContributor(
        contributorAddress
      )
      resolve(isContributor)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

const isContributorBanned = (contributorAddress) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!contributorAddress) {
        return reject(null)
      }
      const racksPM = await getRacksProjectManagerContract()
      const isBanned = await racksPM.isContributorBanned(contributorAddress)
      resolve(isBanned)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

const getContributorDataByAddress = (contributorAddress) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!contributorAddress) {
        return reject(null)
      }
      const racksPM = await getRacksProjectManagerContract()
      const contr = await racksPM.getContributorData(contributorAddress)
      resolve(contr)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

// RACKS PROJECT MANAGER ADMIN

const createProjectCall = (
  name,
  colateralCost,
  reputationLevel,
  maxContributorsNumber
) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !name ||
        !colateralCost ||
        !reputationLevel ||
        !maxContributorsNumber
      ) {
        return reject(null)
      }
      const racksPM = await getRacksProjectManagerContract()
      const wallet = await getAdminWallet()
      let racksPMSigner = racksPM.connect(wallet)
      let tx = await racksPMSigner.createProject(
        name,
        colateralCost,
        reputationLevel,
        maxContributorsNumber
      )
      await tx.wait()
      resolve(tx)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

const setContributorStateToBanList = (
  contributorAddress,
  bannedState = true
) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!contributorAddress) {
        return reject(null)
      }
      const racksPM = await getRacksProjectManagerContract()
      const wallet = await getAdminWallet()
      let racksPMSigner = racksPM.connect(wallet)
      let tx = await racksPMSigner.setContributorStateToBanList(
        contributorAddress,
        bannedState
      )
      await tx.wait()
      resolve(tx)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

const modifyContributorRP = (contributorAddress, points, add = true) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!contributorAddress || !points) {
        return reject(null)
      }
      const racksPM = await getRacksProjectManagerContract()
      const wallet = await getAdminWallet()
      let racksPMSigner = racksPM.connect(wallet)
      let tx = await racksPMSigner.modifyContributorRP(
        contributorAddress,
        points,
        add
      )
      await tx.wait()
      resolve(tx)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

// PROJECT

const isContributorInProject = (projectAddress, contributorAddress) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!projectAddress) {
        return reject(null)
      }
      const projectContract = await getProjectContract(projectAddress)
      const isProjectContributor = await projectContract.isContributorInProject(
        contributorAddress
      )
      resolve(isProjectContributor)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

const projectIsActive = (projectAddress) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!projectAddress) {
        return reject(null)
      }
      const projectContract = await getProjectContract(projectAddress)
      const isActive = await projectContract.isActive()
      resolve(isActive)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

const projectIsFinished = (projectAddress) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!projectAddress) {
        return reject(null)
      }
      const projectContract = await getProjectContract(projectAddress)
      const completed = await projectContract.isFinished()
      resolve(completed)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

const projectIsDeleted = (projectAddress) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!projectAddress) {
        return reject(null)
      }
      const projectContract = await getProjectContract(projectAddress)
      const isDeleted = await projectContract.isDeleted()
      resolve(isDeleted)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

const projectGetTotalAmountFunded = (projectAddress) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!projectAddress) {
        return reject(null)
      }
      const projectContract = await getProjectContract(projectAddress)
      const projectFunds = parseInt(
        ethers.utils.formatEther(await projectContract.getTotalAmountFunded())
      )
      resolve(projectFunds)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

// PROJECT ADMIN

const approveProject = (projectAddress) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!projectAddress) {
        return reject(null)
      }
      const projectContract = await getProjectContract(projectAddress)
      const wallet = await getAdminWallet()
      let projectSigner = projectContract.connect(wallet)
      const tx = await projectSigner.approveProject()
      await tx.wait()
      resolve(tx)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

const finishProject = (
  projectAddress,
  totalReputationPointsReward,
  contributorParticipation
) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !projectAddress ||
        !totalReputationPointsReward ||
        !contributorParticipation
      ) {
        return reject(null)
      }
      const projectContract = await getProjectContract(projectAddress)
      const wallet = await getAdminWallet()
      let projectSigner = projectContract.connect(wallet)
      const numContributors = Number(
        await projectContract.getNumberOfContributors()
      )
      const isFinished = await projectContract.isFinished()
      if (contributorParticipation.length !== numContributors)
        return reject(null)
      if (isFinished) return reject(null)

      let tx = await projectSigner.finishProject(
        totalReputationPointsReward,
        contributorParticipation
      )
      await tx.wait()
      resolve(tx)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

const deleteProjectCall = (projectAddress) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!projectAddress) {
        return reject(null)
      }
      const projectContract = await getProjectContract(projectAddress)
      const wallet = await getAdminWallet()
      let projectSigner = projectContract.connect(wallet)
      const tx = await projectSigner.deleteProject()
      await tx.wait()
      resolve(tx)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

const projectRemoveContributor = (projectAddress, contributorAddress) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!projectAddress || !contributorAddress) {
        return reject(null)
      }
      const projectContract = await getProjectContract(projectAddress)
      const wallet = await getAdminWallet()
      let projectSigner = projectContract.connect(wallet)
      let tx = await projectSigner.removeContributor(contributorAddress, true)
      await tx.wait()
      resolve(tx)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

const ProjectGetContributorByAddress = (projectAddress, contributorAddress) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!projectAddress || !contributorAddress) {
        return reject(null)
      }
      const projectContract = await getProjectContract(projectAddress)
      const racksPMContract = await getRacksProjectManagerContract()
      const wallet = await getAdminWallet()
      let projectSigner = projectContract.connect(wallet)
      let contributorOnChain = await projectSigner.getContributorByAddress(
        contributorAddress
      )

      const level = Number(
        await racksPMContract.calculateLevel(
          contributorOnChain.reputationPoints
        )
      )
      const data = { ...contributorOnChain, reputationLevel: level }
      resolve(data)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

// HOLDER VALIDATION

const validateHolder = async (req, res) => {
  try {
    const address = req.query.address
    if (!address) return res.status(404).json({ message: 'Not address given' })

    const holderValidation = await getHolderValidationContract()
    const isHolder =
      (await holderValidation.isHolder(address)) != ethers.constants.AddressZero

    if (!isHolder)
      return res.status(400).json({ message: 'you need at least 1 token' })

    res.status(200).json({ isHolder: isHolder })
  } catch (error) {
    handleError(res, error)
  }
}

const validateHolderInternal = (address) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!address) {
        return reject(null)
      }
      const holderValidation = await getHolderValidationContract()
      const isHolder =
        (await holderValidation.isHolder(address)) !=
        ethers.constants.AddressZero
      resolve(isHolder)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

// MRCRYPTO

const validateNftsAddress = (nftn) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!nftn) {
        return reject(null)
      }
      const mrCrypto = await getMrCryptoContract()
      const nfts = await mrCrypto.ownerOf(nftn)
      resolve(nfts.toString())
    } catch (error) {
      reject(error)
    }
  })
}

const getNfts = (address) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!address) {
        return reject(null)
      }
      const mrCrypto = await getMrCryptoContract()
      const nfts = await mrCrypto.walletOfOwner(address)

      resolve(nfts.toString())
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  getAdminWallet,
  getRacksProjectManagerContract,
  getProjectContract,
  isWalletContributor,
  isContributorBanned,
  getContributorDataByAddress,
  createProjectCall,
  setContributorStateToBanList,
  modifyContributorRP,
  deleteProjectCall,
  approveProject,
  finishProject,
  projectRemoveContributor,
  ProjectGetContributorByAddress,
  projectIsActive,
  projectIsFinished,
  projectIsDeleted,
  isContributorInProject,
  projectGetTotalAmountFunded,
  validateHolder,
  validateHolderInternal,
  validateNftsAddress,
  getNfts
}
