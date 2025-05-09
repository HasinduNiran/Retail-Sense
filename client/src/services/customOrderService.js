import axios from 'axios';
import API_CONFIG from '../config/apiConfig';

// Create a new custom order
export const createCustomOrder = async (orderData) => {
  try {
    const response = await axios.post(`${API_CONFIG.BASE_URL}/api/custom-orders/create`, orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating custom order:', error.response?.data || error.message);
    throw error;
  }
};

// Get all custom orders for admin
export const getAllCustomOrders = async () => {
  try {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/api/custom-orders`);
    return response.data;
  } catch (error) {
    console.error('Error fetching custom orders:', error.response?.data || error.message);
    throw error;
  }
};

// Get custom orders for a specific user
export const getUserCustomOrders = async (userId) => {
  try {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/api/custom-orders/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user custom orders:', error.response?.data || error.message);
    throw error;
  }
};

// Get a specific custom order by ID
export const getCustomOrderById = async (orderId) => {
  try {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/api/custom-orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching custom order:', error.response?.data || error.message);
    throw error;
  }
};

// Update custom order status
export const updateCustomOrderStatus = async (orderId, status) => {
  try {
    const response = await axios.put(`${API_CONFIG.BASE_URL}/api/custom-orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating custom order status:', error.response?.data || error.message);
    throw error;
  }
};

// Approve and convert custom order to regular order
export const approveCustomOrder = async (orderId) => {
  try {
    // Log for debugging
    console.log(`Approving custom order with ID: ${orderId}`);
    
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    
    const response = await axios.put(`${API_CONFIG.BASE_URL}/api/custom-orders/${orderId}/approve`, {}, {
      timeout: 10000 // 10 second timeout to give server time to process
    });
    
    return response.data;
  } catch (error) {
    console.error('Error approving custom order:', error);
    
    // Return a consistent error format even when the API call fails
    if (error.response?.data) {
      throw error.response.data;
    } else {
      throw {
        success: false,
        message: error.message || 'Network or server error',
        error: error.toString()
      };
    }
  }
};

// Reject custom order
export const rejectCustomOrder = async (orderId, reason) => {
  try {
    const response = await axios.put(`${API_CONFIG.BASE_URL}/api/custom-orders/${orderId}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error rejecting custom order:', error.response?.data || error.message);
    throw error;
  }
};

// Delete custom order
export const deleteCustomOrder = async (orderId) => {
  try {
    const response = await axios.delete(`${API_CONFIG.BASE_URL}/api/custom-orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting custom order:', error.response?.data || error.message);
    throw error;
  }
};
