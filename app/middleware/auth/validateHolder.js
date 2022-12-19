const { handleError } = require('../utils/handleError')
const ethers = require('ethers')
const {
  contractAddresses,
  RacksPmAbi,
  HolderValidationAbi
} = require('../../../web3Constants')

const validateHolder = async (req, res, next) => {
  try {
    //TODO: recibir por parametro | body el address a verificar

    const address = req.query.address
    if (!address) return res.status(404).json({ message: 'Not address given' })

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

    const holderValidationAddress = await racksPM.getHolderValidationInterface()

    const holderValidation = new ethers.Contract(
      holderValidationAddress,
      HolderValidationAbi,
      provider
    )
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

      const holderValidationAddress =
        await racksPM.getHolderValidationInterface()

      const holderValidation = new ethers.Contract(
        holderValidationAddress,
        HolderValidationAbi,
        provider
      )
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

module.exports = { validateHolder, validateHolderInternal }
