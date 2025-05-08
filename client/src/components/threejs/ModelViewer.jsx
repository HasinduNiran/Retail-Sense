import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import ClothingModel from './ClothingModel';
import FallbackBox from './FallbackBox';
import ModelFallback from './ModelFallback';

const ModelViewer = ({ 
  textureUrl, 
  backTextureUrl, // Optional back texture
  modelPath, 
  clothingType = 'tshirt' 
}) => {
  const [modelError, setModelError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if the model path exists
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    
    const checkModel = async () => {
      try {
        const response = await fetch(modelPath);
        if (!response.ok && isMounted) {
          setModelError(true);
        }
      } catch (error) {
        if (isMounted) {
          setModelError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    checkModel();
    
    return () => {
      isMounted = false;
    };
  }, [modelPath]);
  
  return (
    <motion.div
      className="w-full h-full aspect-square rounded-lg overflow-hidden bg-white relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 2.5], fov: 50 }}
        style={{ 
          width: '100%', 
          height: '100%',
          background: 'linear-gradient(to bottom, #f0f0f0, #ffffff)' 
        }}
      >
        <Suspense fallback={<ModelFallback />}>
          {isLoading ? (
            <ModelFallback />
          ) : modelError ? (
            <FallbackBoxWithTexture 
              textureUrl={textureUrl} 
              clothingType={clothingType}
            />
          ) : (
            <ClothingModel 
              frontTextureUrl={textureUrl}
              backTextureUrl={backTextureUrl || textureUrl} // Use front texture for back if not provided
              modelPath={modelPath}
              autoRotate={true}
            />
          )}
        </Suspense>
      </Canvas>
      
      {modelError && (
        <div className="absolute bottom-2 left-0 right-0 text-center">
          <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
            Using simple 3D preview (models not found)
          </span>
        </div>
      )}
    </motion.div>
  );
};

// Helper component that loads texture and passes it to FallbackBox
const FallbackBoxWithTexture = ({ textureUrl, clothingType }) => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <FallbackBox textureUrl={textureUrl} clothingType={clothingType} />
    </>
  );
};

export default ModelViewer; 