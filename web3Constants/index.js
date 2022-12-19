const contractAddresses = require('./networkMapping.json')
const RacksPmAbi = require('./goerli/RacksProjectManager.json')
const HolderValidationAbi = require('./goerli/HolderValidation.json')
const ProjectAbi = require('./goerli/Project.json')
const MrCryptoAbi = require('./goerli/MRCRYPTO.json')
const MockErc20Abi = require('./goerli/MockErc20.json')

module.exports = {
  contractAddresses,
  RacksPmAbi,
  HolderValidationAbi,
  ProjectAbi,
  MrCryptoAbi,
  MockErc20Abi
}
