import { motion } from "framer-motion";
import { useState, useEffect, Suspense, lazy, useTransition } from "react";
import { useSelector } from "react-redux"; // Added for currentUser
import Navbar from "../../components/Navbar";
import { saveDesign } from "../../services/designService";
import { toast } from "react-toastify";

const ModelViewer = lazy(() => import("../../components/threejs/ModelViewer"));
const ModelFallback = lazy(() => import("../../components/threejs/ModelFallback"));

const CustomizePage = () => {
  const { currentUser } = useSelector((state) => state.user); // Get currentUser
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generationId, setGenerationId] = useState(null);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [viewMode, setViewMode] = useState("2d");
  const [clothingType, setClothingType] = useState("tshirt");
  const [isPending, startTransition] = useTransition();

  const samplePrompts = [
    "A casual red t-shirt with minimalist graphic design",
    "Modern black t-shirt with geometric patterns",
    "Summer cotton t-shirt with tropical print",
    "Vintage-inspired band t-shirt in faded navy blue"
  ];

  const API_KEY = "e5c50229-779c-4b33-b9b0-b5d013fb3318";

  const checkGenerationStatus = async (genId) => {
    try {
      const response = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${genId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'authorization': `Bearer ${API_KEY}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to check generation status');
      }
      
      const data = await response.json();
      
      if (data.generations_by_pk.status === 'COMPLETE') {
        if (data.generations_by_pk.generated_images && data.generations_by_pk.generated_images.length > 0) {
          setGeneratedImage(data.generations_by_pk.generated_images[0].url);
          setIsLoading(false);
          setStatusMessage("");
        } else {
          setError('No images were generated');
          setIsLoading(false);
        }
      } else if (data.generations_by_pk.status === 'FAILED') {
        setError('Image generation failed');
        setIsLoading(false);
      } else {
        setStatusMessage(`Status: ${data.generations_by_pk.status}...`);
        setTimeout(() => checkGenerationStatus(genId), 3000);
      }
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleGenerateDress = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedImage("");
    setStatusMessage("Initiating image generation...");
    
    try {
      const response = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'authorization': `Bearer ${API_KEY}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          modelId: "6b645e3a-d64f-4341-a6d8-7a3690fbf042",
          prompt: `${clothingType} fashion design: ${prompt}. High quality professional ${clothingType} design with detailed fabric texture and stitching details.`,
          num_images: 1,
          width: 1024,
          height: 1024,
          ultra: true,
          enhancePrompt: true
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to start image generation');
      }
      
      const data = await response.json();
      const generationId = data.sdGenerationJob.generationId;
      setGenerationId(generationId);
      setStatusMessage("Generation in progress. Please wait...");
      
      setTimeout(() => checkGenerationStatus(generationId), 3000);
      
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleSaveDesign = async () => {
    try {
      if (!generatedImage) {
        toast.error("Please generate a design first");
        return;
      }
      if (!currentUser?._id) {
        toast.error("You must be logged in to save a design");
        return;
      }
      
      setIsLoading(true);
      
      const designData = {
        imageUrl: generatedImage,
        clothingType: clothingType,
        prompt: prompt,
        previewType: viewMode,
        userId: currentUser._id, // Added userId
      };
      
      console.log('Saving design:', designData); // Debug log
      const response = await saveDesign(designData);
      
      setIsLoading(false);
      
      if (response.message === "Design saved successfully") {
        toast.success("Design saved successfully!");
      } else {
        toast.error("Failed to save design: " + (response.message || "Unknown error"));
      }
    } catch (error) {
      setIsLoading(false);
      toast.error("Error saving design: " + (error.response?.data?.message || error.message));
      console.error("Error saving design:", error);
    }
  };

  const handleViewModeChange = (mode) => {
    if (mode === "3d") {
      startTransition(() => {
        setViewMode(mode);
      });
    } else {
      setViewMode(mode);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup function
    };
  }, []);

  return (
    <div className="min-h-screen bg-PrimaryColor">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-md border-2 border-SecondaryColor mb-6 w-fit">
            <div className="bg-PrimaryColor p-1.5 rounded-full mr-2 border-2 border-SecondaryColor">
              <svg className="text-DarkColor w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-DarkColor">Design Your Dream {clothingType.charAt(0).toUpperCase() + clothingType.slice(1)}</h1>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 border-2 border-SecondaryColor"
          >
            <h2 className="text-2xl font-semibold text-DarkColor mb-4">
              Describe Your {clothingType.charAt(0).toUpperCase() + clothingType.slice(1)}
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Clothing Type
              </label>
              <select
                value={clothingType}
                onChange={(e) => setClothingType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-SecondaryColor focus:border-transparent"
              >
                <option value="tshirt">T-Shirt</option>
                <option value="dress">Dress</option>
                <option value="pants">Pants</option>
                <option value="jacket">Jacket</option>
              </select>
            </div>
            
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Describe your dream ${clothingType} in detail... (e.g., style, color, graphic design, fit)`}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-SecondaryColor focus:border-transparent resize-none"
              />
              
              <div>
                <h3 className="text-sm font-medium text-DarkColor mb-2">
                  Need inspiration? Try these:
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {samplePrompts.map((samplePrompt, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(samplePrompt)}
                      className="text-left text-sm p-2 hover:bg-PrimaryColor rounded-md transition-colors duration-200"
                    >
                      {samplePrompt}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerateDress}
                disabled={!prompt.trim() || isLoading}
                className={`w-full py-3 rounded-lg font-semibold text-white
                  ${!prompt.trim() || isLoading 
                    ? 'bg-DarkColor opacity-60' 
                    : 'bg-SecondaryColor hover:bg-DarkColor'
                  } transition-colors duration-200`}
              >
                {isLoading ? 'Generating...' : 'Generate Design'}
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 border-2 border-SecondaryColor"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-DarkColor">
                Your Design Preview
              </h2>
              
              {generatedImage && !isLoading && (
                <div className="flex space-x-2 bg-gray-100 p-1 rounded-full">
                  <button
                    onClick={() => handleViewModeChange("2d")}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      viewMode === "2d" 
                        ? "bg-SecondaryColor text-white"
                        : "text-gray-600"
                    }`}
                  >
                    2D View
                  </button>
                  <button
                    onClick={() => handleViewModeChange("3d")}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      viewMode === "3d"
                        ? "bg-SecondaryColor text-white" 
                        : "text-gray-600"
                    }`}
                    disabled={isPending}
                  >
                    {isPending ? "Loading 3D..." : "3D View"}
                  </button>
                </div>
              )}
            </div>
            
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-SecondaryColor border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-600">{statusMessage || "Creating your design..."}</p>
                  {error && <p className="text-red-500">{error}</p>}
                </div>
              ) : generatedImage ? (
                viewMode === "2d" ? (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={generatedImage}
                    alt="Generated clothing design"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Suspense fallback={<ModelFallback />}>
                    <ModelViewer 
                      textureUrl={generatedImage} 
                      modelPath={`/models/${clothingType}.glb`}
                      clothingType={clothingType}
                    />
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      <span>Drag to rotate • Scroll to zoom</span>
                    </div>
                  </Suspense>
                )
              ) : (
                <div className="text-center p-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">
                    Your design preview will appear here
                  </p>
                  {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>
              )}
            </div>

            {generatedImage && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 space-y-3"
              >
                <button 
                  onClick={handleSaveDesign}
                  className="w-full py-2 px-4 bg-white border border-SecondaryColor text-DarkColor rounded-lg hover:bg-PrimaryColor transition-colors duration-200"
                >
                  Save Design
                </button>
                <button className="w-full py-2 px-4 bg-SecondaryColor text-white rounded-lg hover:bg-DarkColor transition-colors duration-200">
                  Proceed to Order
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CustomizePage;