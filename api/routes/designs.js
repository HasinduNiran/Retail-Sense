import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Design Schema
const designSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  clothingType: { type: String, required: true },
  prompt: { type: String, required: true },
  previewType: { type: String, required: true },
  userId: { type: String, required: true }, // Added userId
  createdAt: { type: Date, default: Date.now },
});
const Design = mongoose.model('Design', designSchema);

// Save Design
router.post('/', async (req, res) => {
  try {
    console.log('Received design data:', req.body);
    const { imageUrl, clothingType, prompt, previewType, userId } = req.body;

    // Validate fields
    if (!imageUrl || typeof imageUrl !== 'string') {
      return res.status(400).json({ message: 'Invalid or missing imageUrl' });
    }
    if (!clothingType || typeof clothingType !== 'string') {
      return res.status(400).json({ message: 'Invalid or missing clothingType' });
    }
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ message: 'Invalid or missing prompt' });
    }
    if (!previewType || typeof previewType !== 'string') {
      return res.status(400).json({ message: 'Invalid or missing previewType' });
    }
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ message: 'Invalid or missing userId' });
    }

    const design = new Design({
      imageUrl,
      clothingType,
      prompt,
      previewType,
      userId,
    });

    await design.save();

    res.status(201).json({
      message: 'Design saved successfully',
      design,
    });
  } catch (error) {
    console.error('Error saving design:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error: ' + error.message });
    }
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Get Designs (filtered by userId if provided)
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const query = userId ? { userId } : {};
    const designs = await Design.find(query);
    res.json(designs);
  } catch (error) {
    console.error('Error fetching designs:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Get Design by ID
router.get('/:id', async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }
    res.json(design);
  } catch (error) {
    console.error('Error fetching design:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Delete Design
router.delete('/:id', async (req, res) => {
  try {
    const design = await Design.findByIdAndDelete(req.params.id);
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }
    res.json({ message: 'Design deleted successfully' });
  } catch (error) {
    console.error('Error deleting design:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

export default router;