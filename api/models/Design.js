import mongoose from 'mongoose';

const designSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  clothingType: {
    type: String,
    required: true,
    enum: ['tshirt', 'dress', 'pants', 'jacket'], // Add more types as needed
    default: 'tshirt'
  },
  prompt: {
    type: String,
    default: ''
  },
  previewType: {
    type: String,
    enum: ['2d', '3d'],
    default: '2d'
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  modelPath: {
    type: String,
    default: null
  },
  dateCreated: {
    type: Date,
    default: Date.now
  }
});

// Add index for faster querying
designSchema.index({ userId: 1, dateCreated: -1 });

// Create the Design model
const Design = mongoose.model('Design', designSchema);

export default Design; 