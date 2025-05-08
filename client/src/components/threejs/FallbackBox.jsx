import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box } from '@react-three/drei';
import { useTexture } from '@react-three/drei';
import { DoubleSide } from 'three';

/**
 * A fallback 3D component to use when GLB models are not available
 * Displays a simple box with the texture applied
 */
const FallbackBox = ({ textureUrl, clothingType }) => {
  const boxRef = useRef();
  
  // Different sizes for different clothing types
  const boxSizes = {
    tshirt: [1.2, 1.5, 0.1],
    dress: [1, 1.8, 0.1],
    pants: [0.8, 1.6, 0.1],
    jacket: [1.3, 1.4, 0.2],
  };
  
  // Load texture with error handling
  let texture = null;
  try {
    texture = useTexture(textureUrl);
  } catch (error) {
    console.error("Error loading fallback texture:", error);
  }
  
  // Rotate the box
  useFrame(() => {
    if (boxRef.current) {
      boxRef.current.rotation.y += 0.005;
    }
  });
  
  // Get appropriate size based on clothing type
  const size = boxSizes[clothingType] || boxSizes.tshirt;
  
  return (
    <Box 
      ref={boxRef}
      args={size}
      position={[0, 0, 0]}
    >
      <meshStandardMaterial 
        color={texture ? 'white' : '#cccccc'}
        map={texture}
        side={DoubleSide}
      />
    </Box>
  );
};

export default FallbackBox; 