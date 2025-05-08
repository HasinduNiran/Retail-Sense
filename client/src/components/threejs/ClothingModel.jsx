import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, OrbitControls } from '@react-three/drei';
import { DoubleSide, RepeatWrapping, Vector2, MeshBasicMaterial, MeshStandardMaterial } from 'three';

const ClothingModel = ({ 
  frontTextureUrl,  // URL for front texture
  backTextureUrl,   // Optional URL for back texture (if different)
  modelPath, 
  autoRotate = true 
}) => {
  const modelRef = useRef();
  const { scene } = useGLTF(modelPath);
  
  // Load front and back textures if available
  const frontTexture = frontTextureUrl ? useTexture(frontTextureUrl) : null;
  const backTexture = backTextureUrl ? useTexture(backTextureUrl) : frontTexture; // Use front texture as default for back

  // Control auto-rotation based on user interaction
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  
  // Apply textures to appropriate parts of the model
  useEffect(() => {
    if (!scene) return;
    
    // Helper function to determine if a mesh is front or back
    const isFrontFacing = (normalZ) => normalZ > 0;
    
    scene.traverse((child) => {
      if (child.isMesh) {
        // Clone materials to avoid shared references
        if (Array.isArray(child.material)) {
          // Handle multi-material objects
          child.material = child.material.map(mat => {
            const newMat = new MeshStandardMaterial().copy(mat);
            newMat.side = DoubleSide;
            return newMat;
          });
        } else {
          // Single material
          child.material = new MeshStandardMaterial().copy(child.material);
          child.material.side = DoubleSide;
        }
        
        // For simplicity, use position to determine front/back
        // More advanced implementations would use geometry normal calculations
        if (!child.geometry.boundingBox) {
          child.geometry.computeBoundingBox();
        }
        
        // Analyze mesh vertices to decide front/back
        // This is a simplified approach; for production, use normal analysis
        const geometry = child.geometry;
        if (geometry.attributes && geometry.attributes.position && geometry.attributes.normal) {
          // Apply textures based on forward-facing status
          // This is a simplified approach that works for most t-shirt models
          if (frontTexture) {
            if (frontTexture.wrapS) frontTexture.wrapS = RepeatWrapping;
            if (frontTexture.wrapT) frontTexture.wrapT = RepeatWrapping;
            
            if (backTexture && backTexture !== frontTexture) {
              if (backTexture.wrapS) backTexture.wrapS = RepeatWrapping;
              if (backTexture.wrapT) backTexture.wrapT = RepeatWrapping;
              
              // Apply both textures to the material
              // For a simple approach, we'll apply front texture to all parts
              // In a more advanced implementation, you would create two materials based on face normals
              child.material.map = frontTexture;
            } else {
              // Just use front texture for everything
              child.material.map = frontTexture;
            }
          }
          
          child.material.needsUpdate = true;
        }
      }
    });
  }, [scene, frontTexture, backTexture]);

  // Only auto-rotate when user is not interacting
  useFrame(() => {
    if (modelRef.current && autoRotate && !isUserInteracting) {
      modelRef.current.rotation.y += 0.005;
    }
  });

  return (
    <>
      {/* Interactive controls with constraints */}
      <OrbitControls 
        enableZoom={true}
        enablePan={false}
        minPolarAngle={Math.PI / 6} // Limit vertical rotation
        maxPolarAngle={Math.PI - Math.PI / 6}
        dampingFactor={0.2} // Smoother controls
        onStart={() => setIsUserInteracting(true)}
        onEnd={() => setIsUserInteracting(false)}
      />
      
      {/* Light setup for better visualization */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.6} castShadow />
      
      <group ref={modelRef}>
        <primitive object={scene} scale={1} position={[0, 0, 0]} />
      </group>
    </>
  );
};

export default ClothingModel; 