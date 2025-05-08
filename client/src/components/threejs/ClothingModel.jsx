import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import { DoubleSide } from 'three';

const ClothingModel = ({ textureUrl, modelPath, autoRotate = true }) => {
  const modelRef = useRef();

  // Always call hooks at the top level
  const { scene } = useGLTF(modelPath);
  const texture = textureUrl ? useTexture(textureUrl) : null;

  // Apply texture to all materials in the model
  useEffect(() => {
    if (scene && texture) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.material.map = texture;
          child.material.needsUpdate = true;
          child.material.side = DoubleSide;
        }
      });
    }
  }, [scene, texture]);

  // Handle rotation
  useFrame(() => {
    if (modelRef.current && autoRotate) {
      modelRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={modelRef}>
      <primitive object={scene} scale={1} position={[0, 0, 0]} />
    </group>
  );
};

export default ClothingModel; 