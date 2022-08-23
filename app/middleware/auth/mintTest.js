const { handleError } = require('../utils/handleError')
const ethers = require('ethers')
const {
  contractAddresses,
  MrCryptoAbi,
  MockErc20Abi
} = require('../../../web3Constanst')

const mintTest = async (req, res) => {
  try {
    const USER_ADDRESS = process.env.ADMIN_ADDRESS
    const USER_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY

    const CONTRACT_ADDRESS =
      process.env.CHAIN_ID in contractAddresses
        ? contractAddresses[process.env.CHAIN_ID]
        : null
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.RINKEBY_PROVIDER
    )
    let wallet = new ethers.Wallet(USER_PRIVATE_KEY, provider)

    const mrCrypto = new ethers.Contract(
      CONTRACT_ADDRESS.MRCRYPTO[0],
      MrCryptoAbi,
      provider
    )
    const mockErc20 = new ethers.Contract(
      CONTRACT_ADDRESS.MockErc20[0],
      MockErc20Abi,
      provider
    )

    let mrCryptoSigner = mrCrypto.connect(wallet)
    let mctx = await mrCryptoSigner.mint(1)
    await mctx.wait()

    let mockErc20Signer = mockErc20.connect(wallet)
    let erctx = await mockErc20Signer.mintMore()
    await erctx.wait()

    const nftBalance = await mrCrypto.balanceOf(USER_ADDRESS)
    const ercBalance = await mockErc20.balanceOf(USER_ADDRESS)

    if (nftBalance < 1)
      return res.status(400).json({ message: 'you need at least 1 token' })

    res
      .status(200)
      .json({ nfts: nftBalance.toString(), erc20: ercBalance.toString() })
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { mintTest }
