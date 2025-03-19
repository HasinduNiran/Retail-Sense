import { useState, useEffect } from 'react';
import ProductCard from '../layouts/ProductCard';
import { FaSpinner } from 'react-icons/fa';
import API_CONFIG from '../config/apiConfig.js';

const Products = () => {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInventories = async () => {
    setLoading(true);
    try {
      // Fetch both regular inventory and retrieved inventory items
      const [inventoryRes, retrievedRes] = await Promise.all([
        fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY}`),
        fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY}/retrieved/all`)
      ]);

      const inventoryData = await inventoryRes.json();
      const retrievedData = await retrievedRes.json();

      // Combine and filter items that have unit prices
      const allItems = [
        ...inventoryData.items || [],
        ...retrievedData || []
      ].filter(item => 
        item.unitPrice && 
        item.unitPrice > 0
      );

      setInventories(allItems);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching inventories:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventories();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-purple-800 mb-8">
          Our Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <FaSpinner className="animate-spin text-4xl text-ExtraDarkColor" />
            </div>
          ) : inventories.length > 0 ? (
            inventories.map((inventory) => (
              <ProductCard
                key={inventory._id}
                id={inventory._id}
                img={inventory.image ? `${API_CONFIG.BASE_URL}/${inventory.image}` : "/default-img.jpg"}
                name={inventory.ItemName}
                price={inventory.unitPrice}
                category={inventory.Category}
                brand={inventory.Brand}
                quantity={inventory.Quantity || inventory.retrievedQuantity}
              />
            ))
          ) : (
            <div className="text-center text-gray-500 py-8 col-span-full">
              No products available at the moment
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;