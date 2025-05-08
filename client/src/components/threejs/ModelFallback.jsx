import React from 'react';
import { Box } from '@react-three/drei';

const ModelFallback = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Box args={[1, 1, 1]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#cccccc" />
      </Box>
    </>
  );
};

export default ModelFallback; 