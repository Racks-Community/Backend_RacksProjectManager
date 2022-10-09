const { matchedData } = require('express-validator')
const { handleError } = require('../../middleware/utils')
const { SiweMessage } = require('siwe')
const { getItemSearch } = require('../../middleware/db')
const User = require('../../models/user')
const userAccessAddress = require('../../models/userAccessAddress')
const { validateHolderInternal } = require('../../middleware/auth')
const {
  saveLoginAttemptsToDB,
  saveUserAccessAndReturnToken,
  registerUser,
  setUserInfo,
  returnRegisterToken
} = require('./helpers')

// const { ethers } = require("ethers");

/**
 * Login function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const loginNft = async (req, res) => {
  try {
    const resp = matchedData(req)
    const { message, signature } = resp
    const siweMessage = new SiweMessage(message)
    const fields = await siweMessage.validate(signature)
    const { nonce, address } = fields
    let NonceCompare = await getItemSearch({ nonce: nonce }, userAccessAddress)

    if (nonce != NonceCompare[0].nonce)
      return res.status(404).json({ message: 'error nonce compare' })
    const isHolder = await validateHolderInternal(address)
    if (isHolder < 1)
      return res.status(404).json({ message: 'you need at least 1 token' })
    const user = (await getItemSearch({ address: address }, User))[0]
    if (!user) {
      let userRegister = {
        email: req.email ? req.email : address + '@racks.com',
        password: req.password
          ? req.password
          : address + nonce + Math.floor(Date.now() / 1000),
        address
      }
      const item = await registerUser(userRegister)
      const userInfo = await setUserInfo(item)
      const response = await returnRegisterToken(item, userInfo)
      res.status(201).json(response)
    } else {
      await saveLoginAttemptsToDB(user)
      res.status(200).json(await saveUserAccessAndReturnToken(req, user))
    }
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { loginNft }
