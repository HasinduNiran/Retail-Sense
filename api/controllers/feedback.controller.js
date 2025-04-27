import Feedback from '../models/feedback.model.js'; // Adjusted import path
import Order from '../models/order.model.js';     // Adjusted import path

// Create new feedback
export const createFeedback = async (req, res) => {
    try {
        const { userId, orderId, items, rating, comment } = req.body;

        // Validate required fields
        if (!userId || !orderId || !items || !rating) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Fetch the order to get additional details
        const order = await Order.findOne({ _id: orderId });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Validate that the items provided in the request match the order
        const feedbackItems = items.map(item => ({
            itemTitle: item.title, // This matches the Order schema (item.title)
            quantity: item.quantity,
            price: item.price,
            img: item.img
        }));

        // Create new feedback
        const newFeedback = new Feedback({
            userId,
            orderId,
            orderDate: order.createdAt, // Store the order creation date
            items: feedbackItems,       // Store the items array
            rating,
            comment,
        });
        await newFeedback.save();
        res.status(201).json({ success: true, message: 'Feedback created successfully' });
    } catch (error) {
        console.error('Error creating feedback:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get all feedback
export const getAllFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find().populate('orderId');
        res.status(200).json({ success: true, data: feedbacks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get feedback by userId
export const getFeedbackByUserId = async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ userId: req.params.userId }).populate('orderId');
        res.status(200).json({ success: true, data: feedbacks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update feedback
export const updateFeedback = async (req, res) => {
    try {
        const { userId, orderId, items, rating, comment } = req.body;

        // Validate required fields
        if (!userId || !orderId || !items || !rating) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Map the items, ensuring the field names match the Feedback schema
        const feedbackItems = items.map(item => ({
            itemTitle: item.itemTitle, // Use itemTitle (from Feedback schema), not title
            quantity: item.quantity,
            price: item.price,
            img: item.img
        }));

        const updatedFeedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            { 
                userId, 
                orderId, 
                items: feedbackItems, 
                rating, 
                comment 
            },
            { new: true, runValidators: true }
        ).populate('orderId'); // Populate the orderId field in the response

        if (!updatedFeedback) {
            return res.status(404).json({ success: false, message: 'Feedback not found' });
        }
        res.status(200).json({ success: true, data: updatedFeedback, message: 'Feedback updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete feedback
export const deleteFeedback = async (req, res) => {
    try {
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: 'Invalid feedback ID format' });
        }

        const deletedFeedback = await Feedback.findByIdAndDelete(req.params.id);
        if (!deletedFeedback) {
            return res.status(404).json({ success: false, message: 'Feedback not found' });
        }

        res.status(200).json({ success: true, message: 'Feedback deleted successfully' });
    } catch (error) {
        console.error('Delete Feedback Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};