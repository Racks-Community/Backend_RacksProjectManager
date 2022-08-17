const { validateCreateProject } = require('./validateCreateProject')
const { validateDeleteProject } = require('./validateDeleteProject')
const { validateGetProject } = require('./validateGetProject')
const { validateUpdateProject } = require('./validateUpdateProject')

module.exports = {
  validateCreateProject,
  validateDeleteProject,
  validateGetProject,
  validateUpdateProject
}
