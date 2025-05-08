import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import Design from '../models/Design.js';

const router = express.Router();

/**
 * @route   POST /api/designs
 * @desc    Save a new design
 * @access  Private
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { imageUrl, clothingType, prompt, previewType } = req.body;
    
    if (!imageUrl || !clothingType) {
      return res.status(400).json({ message: 'Image URL and clothing type are required' });
    }
    
    const newDesign = new Design({
      userId: req.user.id,
      imageUrl,
      clothingType,
      prompt: prompt || '',
      previewType: previewType || '2d',
      dateCreated: new Date(),
    });
    
    const savedDesign = await newDesign.save();
    
    res.status(201).json({
      success: true,
      design: savedDesign,
    });
  } catch (error) {
    console.error('Error saving design:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/designs
 * @desc    Get all designs for a user
 * @access  Private
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const designs = await Design.find({ userId: req.user.id }).sort({ dateCreated: -1 });
    
    res.status(200).json({
      success: true,
      designs,
    });
  } catch (error) {
    console.error('Error fetching designs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/designs/:id
 * @desc    Get a specific design by ID
 * @access  Private
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const design = await Design.findOne({ 
      _id: req.params.id,
      userId: req.user.id 
    });
    
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }
    
    res.status(200).json({
      success: true,
      design,
    });
  } catch (error) {
    console.error('Error fetching design:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   DELETE /api/designs/:id
 * @desc    Delete a design
 * @access  Private
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const design = await Design.findOneAndDelete({ 
      _id: req.params.id,
      userId: req.user.id 
    });
    
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Design deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting design:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router; 