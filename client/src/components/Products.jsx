import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import ProductCard from '../layouts/ProductCard';
import { FaSpinner, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import API_CONFIG from '../config/apiConfig.js';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Products = () => {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Custom arrows for the carousel
  const NextArrow = ({ onClick }) => (
    <button 
      className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-md hover:bg-gray-100 transition-all"
      onClick={onClick}
    >
      <FaArrowRight className="text-purple-800" />
    </button>
  );

  NextArrow.propTypes = {
    onClick: PropTypes.func
  };

  const PrevArrow = ({ onClick }) => (
    <button 
      className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-md hover:bg-gray-100 transition-all"
      onClick={onClick}
    >
      <FaArrowLeft className="text-purple-800" />
    </button>
  );

  PrevArrow.propTypes = {
    onClick: PropTypes.func
  };

  // Carousel settings
  const settings = {
    dots: true,
    infinite: inventories.length > 3,
    speed: 500,
    slidesToShow: 3, // Reduced from 4 to 3 for larger cards
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  const fetchInventories = async () => {
    setLoading(true);
    try {
      // Fetch both regular inventory and retrieved inventory items
      const [inventoryRes, retrievedRes] = await Promise.all([
        fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY.BASE}`),
        fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY.RETRIEVED.ALL}`)
      ]);

      const inventoryData = await inventoryRes.json();
      const retrievedData = await retrievedRes.json();

      // Combine and filter items that have unit prices or final prices
      const allItems = [
        ...inventoryData.items || [],
        ...retrievedData || []
      ].filter(item => 
        (item.finalPrice && item.finalPrice > 0) || 
        (item.unitPrice && item.unitPrice > 0)
      );

      setInventories(allItems);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching inventories:', error);
      setLoading(false);
    }
  };

  const handleItemClick = (itemId) => {
    navigate(`/item/${itemId}`);
  };

  useEffect(() => {
    fetchInventories();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-purple-800 mb-12">
          Our Products
        </h2>
        <div className="relative px-8 md:px-12">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="animate-spin text-4xl text-purple-600" />
            </div>
          ) : inventories.length > 0 ? (
            <Slider {...settings}>
              {inventories.map((item) => (
                <div key={item._id} className="px-4 py-2">
                  <div onClick={() => handleItemClick(item._id)} className="cursor-pointer">
                    <ProductCard
                      id={item._id}
                      img={item.image ? `${API_CONFIG.BASE_URL}/${item.image}` : "/default-img.jpg"}
                      name={item.ItemName}
                      price={item.finalPrice || item.unitPrice}
                      originalPrice={item.originalPrice || (item.finalPrice && item.unitPrice > item.finalPrice ? item.unitPrice : null)}
                      category={item.Category}
                      brand={item.Brand}
                      quantity={item.Quantity || item.retrievedQuantity}
                    />
                  </div>
                </div>
              ))}
            </Slider>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No products available at the moment
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;