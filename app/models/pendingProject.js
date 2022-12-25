const mongoose = require('mongoose'),
  Schema = mongoose.Schema
const mongoosePaginate = require('mongoose-paginate-v2')
const validator = require('validator')

const EventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    details: {
      type: String
    },
    requirements: {
      type: String,
      required: true
    },
    reputationLevel: {
      type: Number,
      default: 1,
      required: true
    },
    colateralCost: {
      type: Number,
      default: 0,
      required: true
    },
    maxContributorsNumber: {
      type: Number,
      default: 0,
      required: true
    },
    imageURL: {
      type: String,
      default: process.env.API_URL + 'images/racks.png'
    },
    approveStatus: {
      type: String,
      default: 'PENDING'
    },
    visibleForAll: {
      type: Boolean,
      default: false
    },
    isProgramming: {
      type: Boolean,
      default: true
    },
    githubRepository: {
      type: String,
      validate: {
        validator(v) {
          return v === '' ? true : validator.isURL(v)
        },
        message: 'NOT_A_VALID_URL'
      },
      lowercase: true
    },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  {
    versionKey: false,
    timestamps: true
  }
)
EventSchema.methods.setImgUrl = function setImgUrl(filename) {
  this.imageURL = process.env.API_URL + 'images/' + filename
}
EventSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('PendingProject', EventSchema)
