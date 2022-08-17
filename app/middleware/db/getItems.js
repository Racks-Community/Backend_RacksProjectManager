const { buildErrObject, itemNotFound  } = require('../../middleware/utils')

const { listInitOptions } = require('./listInitOptions')
const { cleanPaginationID } = require('./cleanPaginationID')

/**
 * Gets items from database
 * @param {Object} req - request object
 * @param {Object} query - query object
 */
const getItems = async (req = {}, model = {}, query = {}) => {
  const options = await listInitOptions(req)
  return new Promise((resolve, reject) => {
    model.paginate(query, options, (err, items) => {
      if (err) {
        return reject(buildErrObject(422, err.message))
      }
      resolve(cleanPaginationID(items))
    })
  })
}

const getItemsCustom = async (model = {}, query = {}, params = {}) => {
  return new Promise((resolve, reject) => {
    model.find(
      query,
      params
     , async (err, items) => {
      try {
        await itemNotFound(err, items, 'NOT_FOUND')
        resolve(items)
      } catch (error) {
        reject(error)
      }
    })
  })
}

module.exports = { getItems, getItemsCustom }
