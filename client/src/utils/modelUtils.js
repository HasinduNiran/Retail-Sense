/**
 * Utility functions for handling 3D models
 */

/**
 * Get the appropriate model path based on clothing type
 * @param {string} clothingType - Type of clothing (tshirt, dress, pants, etc.)
 * @returns {string} - Path to the model file
 */
export const getModelPathByType = (clothingType) => {
  const modelMap = {
    tshirt: '/models/tshirt.glb',
    dress: '/models/dress.glb',
    pants: '/models/pants.glb',
    jacket: '/models/jacket.glb',
    // Add more clothing types as needed
    default: '/models/tshirt.glb', // Default fallback
  };
  
  return modelMap[clothingType] || modelMap.default;
};

/**
 * Check if a model for the given clothing type is available
 * @param {string} clothingType - Type of clothing
 * @returns {boolean} - Whether the model is available
 */
export const isModelAvailable = (clothingType) => {
  const availableTypes = ['tshirt', 'dress', 'pants', 'jacket'];
  return availableTypes.includes(clothingType.toLowerCase());
};

/**
 * Preload common 3D models to improve user experience
 */
export const preloadCommonModels = () => {
  // This would typically use THREE.GLTFLoader or useGLTF.preload()
  // Implementation depends on your chosen method
  console.log('Preloading common 3D models...');
  // Example implementation would go here
}; 