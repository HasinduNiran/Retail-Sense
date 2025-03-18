import { useEffect, useState } from "react";
import ProductCard from "../layouts/ProductCard";
import { FaSpinner } from "react-icons/fa";
import API_CONFIG from '../config/apiConfig.js';

const Products = () => {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInventories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY}`);
      const data = await res.json();
      const availableItems = data.items.filter(item => 
        item.unitPrice && 
        item.Quantity > 0 && 
        item.StockStatus !== 'out-of-stock'
      );
      setInventories(availableItems);
    } catch (error) {
      console.error("Error fetching inventories:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInventories();
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center px-5 pt-24 lg:pt-16">
      <div>
        <h1 className="font-semibold text-4xl text-center text-ExtraDarkColor">
          New Arrivals
        </h1>
      </div>

      <div className="flex flex-wrap justify-center gap-5 pt-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
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
              quantity={inventory.Quantity}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            No products available at the moment
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;