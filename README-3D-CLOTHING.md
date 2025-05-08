# 3D Clothing Customization Feature

This feature allows users to create and customize clothing designs, view them in both 2D and 3D, and save their designs to their account.

## Setup Instructions

### 1. Install Required Dependencies

In the client directory, run:

```bash
npm install @react-three/fiber@8.15.19 @react-three/drei@9.99.7 three@0.161.0
```

### 2. Create 3D Model Directory

Create a directory for storing 3D models:

```bash
mkdir -p public/models
```

### 3. Add 3D Models

For the feature to work correctly, you need to add GLB model files for different clothing types:

- `public/models/tshirt.glb` - T-shirt model
- `public/models/dress.glb` - Dress model
- `public/models/pants.glb` - Pants model
- `public/models/jacket.glb` - Jacket model

### 4. UV-Mapping Your Models

For proper texture mapping on 3D models:

1. Create models in Blender (or another 3D modeling tool)
2. Ensure proper UV-mapping for texture application
3. Export as GLB format with:
   - Proper scale and orientation
   - Include materials 
   - Use standard UV maps

## Feature Components

The feature consists of the following components:

### Frontend

- `ModelViewer.jsx` - Main 3D scene container using React Three Fiber
- `ClothingModel.jsx` - Component for rendering 3D clothing with textures
- `ModelFallback.jsx` - Loading state for 3D models
- `CustomizePage.jsx` - Page with design generation and viewing options
- `designService.js` - Service for interacting with design-related APIs

### Backend

- `api/models/Design.js` - MongoDB schema for designs
- `api/routes/designs.js` - API routes for saving and retrieving designs

## Using Custom 3D Models

To use your own custom 3D models:

1. Create UV-mapped models in Blender
2. Export as GLB format
3. Place in the `public/models` directory
4. Update the `modelUtils.js` file with the path to your new model
5. Add the new clothing type to:
   - Design.js schema enum values 
   - CustomizePage.jsx dropdown options

## Performance Optimization

- Models are loaded using lazy loading and suspense
- Use compressed textures for better performance
- Consider using low-poly models with normal maps for detail
- Implement progressive loading for larger models
- Consider using draco compression for complex models

## Extending the Feature

- Add more customization options (colors, patterns, etc.)
- Implement avatars to try on clothing
- Add more interactive elements (zoom, pan, etc.)
- Implement a gallery of saved designs
- Add size estimation and fitting guide

## Troubleshooting

Common issues:

- If models don't appear, check browser console for errors
- If textures don't map correctly, check UV mapping in Blender
- If performance is slow, optimize 3D models and reduce polygon count
- If API calls fail, check network tab and server logs 