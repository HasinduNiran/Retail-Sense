// apiconfig.js
const API_CONFIG = {
  BASE_URL: "http://localhost:3000", // Base URL for your backend
  ENDPOINTS: {
    PROMOTIONS: "/api/promotions",
    User:"api/users",
    Feedback:"api/feedbacks",
    INVENTORY: {
      BASE: "/api/inventory",
      RETRIEVED: {
        ALL: "/api/inventory/retrieved/all",
        SINGLE: (id) => `/api/inventory/retrieved/${id}`
      }
    },

  },
};

export default API_CONFIG;