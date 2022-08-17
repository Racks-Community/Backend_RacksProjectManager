const Project = require('../../models/project')
const { updateItem } = require('../../middleware/db')
const { isIDGood, handleError } = require('../../middleware/utils')
const { matchedData } = require('express-validator')
const { projectExistsExcludingItself } = require('./helpers')

/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const updateProject = async (req, res) => {
  try {
    req = matchedData(req)
    const id = await isIDGood(req.id)
    const doesProjectExists = await projectExistsExcludingItself(id, req.name)
    if (!doesProjectExists) {
      res.status(200).json(await updateItem(id, Project, req))
    }
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { updateProject }
