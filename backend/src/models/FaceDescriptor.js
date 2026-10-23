const mongoose = require('mongoose');

const faceDescriptorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    label: {
      type: String,
      trim: true
    },
    descriptor: {
      type: [Number],
      required: true
      // Typically length 128 for face-api.js, but we do not enforce length here
    }
  },
  {
    timestamps: true
  }
);

faceDescriptorSchema.index({ user: 1 });

module.exports = mongoose.model('FaceDescriptor', faceDescriptorSchema);

