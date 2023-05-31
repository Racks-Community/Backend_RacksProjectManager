const contractAddresses = require('./networkMapping.json')
const RacksPmAbi = require('./mumbai/RacksProjectManager.json')
const HolderValidationAbi = require('./mumbai/HolderValidation.json')
const ProjectAbi = require('./mumbai/Project.json')
const MrCryptoAbi = require('./mumbai/MRCRYPTO.json')
const MockErc20Abi = require('./mumbai/MockErc20.json')

module.exports = {
  contractAddresses,
  RacksPmAbi,
  HolderValidationAbi,
  ProjectAbi,
  MrCryptoAbi,
  MockErc20Abi
}
