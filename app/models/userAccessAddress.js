const mongoose = require('mongoose')
const validator = require('validator')

const userAccessAddress = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true
    },
    nonce: {
      type: String,
      required: true
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)
module.exports = mongoose.model('userAccessAddress', userAccessAddress)
