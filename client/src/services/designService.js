import axios from 'axios';
import { API_URL } from '../apiConfig';

const DESIGN_API = `${API_URL}/api/designs`;

/**
 * Save a design to the database
 * @param {Object} designData - Design data (imageUrl, clothingType, prompt, previewType)
 * @returns {Promise} - API response
 */
export const saveDesign = async (designData) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.post(DESIGN_API, designData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error saving design:', error);
    throw error;
  }
};

/**
 * Get all designs for the current user
 * @returns {Promise} - API response with designs array
 */
export const getUserDesigns = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.get(DESIGN_API, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching designs:', error);
    throw error;
  }
};

/**
 * Get a specific design by ID
 * @param {string} designId - The ID of the design
 * @returns {Promise} - API response with design object
 */
export const getDesignById = async (designId) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.get(`${DESIGN_API}/${designId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching design:', error);
    throw error;
  }
};

/**
 * Delete a design
 * @param {string} designId - The ID of the design to delete
 * @returns {Promise} - API response
 */
export const deleteDesign = async (designId) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.delete(`${DESIGN_API}/${designId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error deleting design:', error);
    throw error;
  }
}; 