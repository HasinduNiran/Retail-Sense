import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "../../components/Navbar";

const CustomizePage = () => {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const samplePrompts = [
    "A elegant red evening gown with lace details",
    "Modern minimalist white wedding dress",
    "Casual summer floral dress with ruffles",
    "Vintage-inspired cocktail dress in navy blue"
  ];

  const handleGenerateDress = () => {
    setIsLoading(true);
    // Simulating API call - replace with actual AI image generation API
    setTimeout(() => {
      setGeneratedImage("/images/customize-dress.jpg");
      setIsLoading(false);
    }, 2000);
  };

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
            <h1 className="text-xl font-bold text-DarkColor">Design Your Dream Dress</h1>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Prompt Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 border-2 border-SecondaryColor"
          >
            <h2 className="text-2xl font-semibold text-DarkColor mb-4">
              Describe Your Dress
            </h2>
            
            {/* Prompt Input */}
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your dream dress in detail... (e.g., style, color, fabric, length)"
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-SecondaryColor focus:border-transparent resize-none"
              />
              
              {/* Sample Prompts */}
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

              {/* Generate Button */}
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

          {/* Display Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 border-2 border-SecondaryColor"
          >
            <h2 className="text-2xl font-semibold text-DarkColor mb-4">
              Your Design Preview
            </h2>
            
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-SecondaryColor border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-600">Creating your design...</p>
                </div>
              ) : generatedImage ? (
                <motion.img
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={generatedImage}
                  alt="Generated dress design"
                  className="w-full h-full object-cover"
                />
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
                </div>
              )}
            </div>

            {generatedImage && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 space-y-3"
              >
                <button className="w-full py-2 px-4 bg-white border border-SecondaryColor text-DarkColor rounded-lg hover:bg-PrimaryColor transition-colors duration-200">
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
