const { validateCreateProject } = require('./validateCreateProject')
const {
  validateCreateProjectWebhook
} = require('./validateCreateProjectWebhook')
const { validateDeleteProject } = require('./validateDeleteProject')
const {
  validateDeletePendingProject
} = require('./validateDeletePendingProject')
const { validateGetProject } = require('./validateGetProject')
const { validateUpdateProject } = require('./validateUpdateProject')
const { validateApproveProject } = require('./validateApproveProject')
const { validateFundProject } = require('./validateFundProject')
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
  validateDeletePendingProject,
  validateGetProject,
  validateUpdateProject,
  validateCompleteProject,
  validateApproveProject,
  validateFundProject,
  validateAddContributorToProject,
  validateRemoveContributorFromProject
}
