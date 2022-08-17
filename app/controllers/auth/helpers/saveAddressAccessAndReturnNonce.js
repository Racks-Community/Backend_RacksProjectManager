const userAccessAddress = require('../../../models/userAccessAddress')

const saveAddressAccessAndReturnNonce = (req = {}) => {
  const update = {
    "$set": {
    "address": req.address,
    "nonce": req.nonce
    }
  };
  return new Promise((resolve, reject) => {
    userAccessAddress.findOneAndUpdate(
      {address: req.address}, update,
      {
        returnNewDocument: true,
        new: true,
        upsert: true
      },
      async (err, item) => {
        try {
          // await itemNotFound(err, item, 'NOT_FOUND')
          resolve({
            nonce: req.nonce,
          })
          // resolve(item)
        } catch (error) {
          reject(error)
        }
      }
    )
  })
}

module.exports = { saveAddressAccessAndReturnNonce }
