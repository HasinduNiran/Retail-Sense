import Promotion from '../models/promotion.model.js';

// Create a new promotion
export const createPromotion = async (req, res) => {
    try {
        const promotionData = req.body;
        const newPromotion = new Promotion(promotionData);
        const savedPromotion = await newPromotion.save();
        
        res.status(201).json({
            success: true,
            data: savedPromotion,
            message: 'Promotion created successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
            message: 'Error creating promotion'
        });
    }
};

// Get all promotions
export const getAllPromotions = async (req, res) => {
    try {
        const promotions = await Promotion.find();
        
        res.status(200).json({
            success: true,
            data: promotions,
            message: 'Promotions retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error retrieving promotions'
        });
    }
};

// Get a single promotion by ID
export const getPromotionById = async (req, res) => {
    try {
        const promotion = await Promotion.findOne({ promotionID: req.params.id });
        
        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: 'Promotion not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: promotion,
            message: 'Promotion retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error retrieving promotion'
        });
    }
};

// Update a promotion
export const updatePromotion = async (req, res) => {
    try {
        const updatedPromotion = await Promotion.findOneAndUpdate(
            { promotionID: req.params.id },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!updatedPromotion) {
            return res.status(404).json({
                success: false,
                message: 'Promotion not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: updatedPromotion,
            message: 'Promotion updated successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
            message: 'Error updating promotion'
        });
    }
};

// Delete a promotion
export const deletePromotion = async (req, res) => {
    try {
        const deletedPromotion = await Promotion.findOneAndDelete({ 
            promotionID: req.params.id 
        });
        
        if (!deletedPromotion) {
            return res.status(404).json({
                success: false,
                message: 'Promotion not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Promotion deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error deleting promotion'
        });
    }
};