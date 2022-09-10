const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

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
    requirements: {
      type: String
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
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)
EventSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('PendingProject', EventSchema)
