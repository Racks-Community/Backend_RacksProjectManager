const { projectExistsByName } = require('./projectExistsByName')
const { projectExistsByAddress } = require('./projectExistsByAddress')
const {
  projectExistsExcludingItself
} = require('./projectExistsExcludingItself')
const { getAllItemsFromDB } = require('./getAllItemsFromDB')

module.exports = {
  projectExistsByName,
  projectExistsByAddress,
  projectExistsExcludingItself,
  getAllItemsFromDB
}
