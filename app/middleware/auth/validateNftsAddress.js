const ethers = require('ethers')
const { contractAddresses, MrCryptoAbi } = require('../../../web3Constanst')

const validateNftsAddress = (nftn) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!nftn) {
        return reject(null)
      }
      const CONTRACT_ADDRESS =
        process.env.CHAIN_ID in contractAddresses
          ? contractAddresses[process.env.CHAIN_ID]
          : null
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.RINKEBY_PROVIDER
      )

      const mrCrypto = new ethers.Contract(
        CONTRACT_ADDRESS.MRCRYPTO[0],
        MrCryptoAbi,
        provider
      )
      const nfts = await mrCrypto.ownerOf(nftn)
      resolve(nfts.toString())
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = { validateNftsAddress }
