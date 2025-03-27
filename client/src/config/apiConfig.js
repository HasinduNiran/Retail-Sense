// apiconfig.js
const API_CONFIG = {
  BASE_URL: "http://localhost:3000", // Base URL for your backend
  ENDPOINTS: {
    PROMOTIONS: "/api/promotions",
    INVENTORY: "/api/inventory", // Added inventory endpoint
    USER: "/api/users", // Added user endpoint
    FEEDBACK: "/api/feedbacks", // Added feedback endpoint
  },
};

export default API_CONFIG;