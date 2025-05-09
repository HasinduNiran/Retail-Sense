import CustomOrder from '../models/customOrder.model.js';
import Order from '../models/order.model.js';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

// Create a new custom order request
export const createCustomOrder = async (req, res) => {
  try {
    const { 
      userId, designId, imageUrl, clothingType, size, quantity, 
      specialInstructions, customerInfo, deliveryInfo 
    } = req.body;

    if (!userId || !imageUrl || !clothingType || !size) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }

    // Calculate price based on clothing type
    let basePrice = 0;
    switch (clothingType) {
      case 'tshirt':
        basePrice = 25.99;
        break;
      case 'dress':
        basePrice = 45.99;
        break;
      case 'pants':
        basePrice = 35.99;
        break;
      case 'jacket':
        basePrice = 55.99;
        break;
      default:
        basePrice = 30.00;
    }
    
    // Price calculation based on quantity
    const price = basePrice * quantity;

    // Create the custom order, only including designId if it exists
    const orderData = {
      userId,
      imageUrl,
      clothingType,
      size,
      quantity,
      specialInstructions,
      customerInfo,
      deliveryInfo,
      price
    };

    // Only add designId if it's provided and valid
    if (designId && mongoose.Types.ObjectId.isValid(designId)) {
      orderData.designId = designId;
    }

    const newCustomOrder = new CustomOrder(orderData);
    const savedOrder = await newCustomOrder.save();
    
    res.status(201).json({
      success: true,
      message: "Custom order request submitted successfully",
      order: savedOrder
    });
  } catch (error) {
    console.error("Error creating custom order:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create custom order", 
      error: error.message 
    });
  }
};

// Get all custom orders
export const getAllCustomOrders = async (req, res) => {
  try {
    const customOrders = await CustomOrder.find().sort({ createdAt: -1 });
    res.status(200).json(customOrders);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching custom orders", 
      error: error.message 
    });
  }
};

// Get custom orders by user ID
export const getUserCustomOrders = async (req, res) => {
  try {
    const userId = req.params.userId;
    const customOrders = await CustomOrder.find({ userId }).sort({ createdAt: -1 });
    
    res.status(200).json(customOrders);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching user custom orders", 
      error: error.message 
    });
  }
};

// Get custom order by ID
export const getCustomOrderById = async (req, res) => {
  try {
    const customOrder = await CustomOrder.findById(req.params.id);
    
    if (!customOrder) {
      return res.status(404).json({ 
        success: false, 
        message: "Custom order not found" 
      });
    }
    
    res.status(200).json(customOrder);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching custom order", 
      error: error.message 
    });
  }
};

// Update custom order status
export const updateCustomOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: "Status is required" 
      });
    }

    const customOrder = await CustomOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!customOrder) {
      return res.status(404).json({ 
        success: false, 
        message: "Custom order not found" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Status updated successfully", 
      customOrder 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error updating custom order status", 
      error: error.message 
    });
  }
};

// Approve custom order and convert to regular order
export const approveAndConvertToOrder = async (req, res) => {
  try {
    const customOrderId = req.params.id;
    
    // Validate the provided ID
    if (!customOrderId || !mongoose.Types.ObjectId.isValid(customOrderId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid order ID format" 
      });
    }
    
    const customOrder = await CustomOrder.findById(customOrderId);
    
    if (!customOrder) {
      return res.status(404).json({ 
        success: false, 
        message: "Custom order not found" 
      });
    }
    
    if (customOrder.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Order is already ${customOrder.status}` 
      });
    }

    // Update custom order status to approved
    customOrder.status = 'approved';
    
    try {
      // Create a regular order based on the custom order
      const orderItems = [{
        itemId: customOrder.designId || 'custom-design', // Use fallback for designId
        quantity: customOrder.quantity || 1,
        price: (customOrder.price || 0) / (customOrder.quantity || 1), // Price per item with fallback
        title: `Custom ${customOrder.clothingType ? customOrder.clothingType.charAt(0).toUpperCase() + customOrder.clothingType.slice(1) : 'Design'}`,
        size: customOrder.size || 'M',
        color: customOrder.color || 'custom', // Custom design fallback
        img: customOrder.imageUrl || ''
      }];

      // Generate order ID 
      const orderId = `CUSTOM-${uuidv4().slice(0, 6).toUpperCase()}`;
      
      // Prepare customer and delivery info 
      const customerInfo = customOrder.customerInfo || {};
      const deliveryInfo = customOrder.deliveryInfo || {};
      
      // Use default values if information is missing
      const newOrder = new Order({
        userId: customOrder.userId,
        items: orderItems,
        total: customOrder.price || 0,
        customerInfo: {
          name: customerInfo.name || 'Customer',
          email: customerInfo.email || 'Not provided',
          mobile: customerInfo.mobile || 'Not provided'
        },
        deliveryInfo: {
          address: deliveryInfo.address || 'Not provided',
          city: deliveryInfo.city || 'Not provided',
          postalCode: deliveryInfo.postalCode || 'Not provided'
        },
        paymentMethod: 'Cash', // Default to Cash for custom orders
        orderId,
        status: 'processing' // Start as processing since it's already approved
      });

      const savedOrder = await newOrder.save();
      
      // Update custom order with reference to the new order
      customOrder.convertedToOrder = true;
      customOrder.orderId = savedOrder._id;
      await customOrder.save();
      
      res.status(200).json({ 
        success: true, 
        message: "Custom order approved and converted to regular order",
        customOrder,
        order: savedOrder
      });
    } catch (orderError) {
      // If order creation fails, still update the status but track the error
      console.error("Error creating regular order:", orderError);
      customOrder.status = 'approved'; // Still set to approved
      customOrder.conversionError = orderError.message; // Track the error
      await customOrder.save();
      
      // Return error response
      return res.status(500).json({
        success: false,
        message: "Error creating regular order",
        error: orderError.message,
        customOrder // Return the custom order that was updated
      });
    }
  } catch (error) {
    console.error("Error approving custom order:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error approving custom order", 
      error: error.message 
    });
  }
};

// Reject custom order
export const rejectCustomOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const customOrder = await CustomOrder.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected',
        rejectionReason: reason || 'No reason provided'
      },
      { new: true }
    );
    
    if (!customOrder) {
      return res.status(404).json({ 
        success: false, 
        message: "Custom order not found" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Custom order rejected", 
      customOrder 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error rejecting custom order", 
      error: error.message 
    });
  }
};

// Delete custom order
export const deleteCustomOrder = async (req, res) => {
  try {
    const customOrder = await CustomOrder.findByIdAndDelete(req.params.id);
    
    if (!customOrder) {
      return res.status(404).json({ 
        success: false, 
        message: "Custom order not found" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Custom order deleted successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error deleting custom order", 
      error: error.message 
    });
  }
};
