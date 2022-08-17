const contractAddresses = require('./networkMapping.json')
const RacksPmAbi = require('./rinkeby/RacksProjectManager.json')
const MrCryptoAbi = require('./rinkeby/MRCRYPTO.json')
const MockErc20Abi = require('./rinkeby/MockErc20.json')

module.exports = {
  contractAddresses,
  RacksPmAbi,
  MrCryptoAbi,
  MockErc20Abi
}
