const { validateCreateProject } = require('./validateCreateProject')
const {
  validateCreateProjectWebhook
} = require('./validateCreateProjectWebhook')
const { validateDeleteProject } = require('./validateDeleteProject')
const { validateGetProject } = require('./validateGetProject')
const { validateUpdateProject } = require('./validateUpdateProject')
const { validateCompleteProject } = require('./validateCompleteProject')
const {
  validateRemoveContributorFromProject
} = require('./validateRemoveContributorFromProject')
const {
  validateAddContributorToProject
} = require('./validateAddContributorToProject')

module.exports = {
  validateCreateProject,
  validateCreateProjectWebhook,
  validateDeleteProject,
  validateGetProject,
  validateUpdateProject,
  validateCompleteProject,
  validateAddContributorToProject,
  validateRemoveContributorFromProject
}
