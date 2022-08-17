const mongoose = require('mongoose')
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
    completed: {
      type: Boolean,
      default: false
    },
    reputationLevel: {
      type: Number,
      default: 1,
      select: false,
      required: true
    },
    colateralCost: {
      type: Number,
      default: 0,
      select: false,
      required: true
    },
    maxContributorsNumber: {
      type: Number,
      default: 0,
      select: false,
      required: true
    },
    address: {
      type: String,
      required: true
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
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)
EventSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('Project', EventSchema)
