import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductCard from "../../layouts/ProductCard";
import Swal from "sweetalert2";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useSelector } from "react-redux";
import { TailSpin } from "react-loader-spinner";
import API_CONFIG from "../../config/apiConfig.js";

const FashionItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  // State hooks
  const [fashionItem, setFashionItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [inventories, setInventories] = useState([]);

  // Fetch item data from backend API
  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching item with ID:', id); // Debug log
        
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/inventory/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch item data (Status: ${response.status})`);
        }
        
        const data = await response.json();
        console.log('Fetched item data:', data); // Debug log
        
        if (!data) {
          throw new Error('No data received from server');
        }
        
        setFashionItem(data);
        setSelectedSize(data.Sizes?.[0] || "");
        setSelectedColor(data.Colors?.[0] || "");
      } catch (error) {
        console.error('Error fetching item:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    } else {
      setError('No item ID provided');
      setLoading(false);
    }
  }, [id]);

  // Fetch recommended inventories
  useEffect(() => {
    const fetchInventories = async () => {
      try {
        const res = await fetch(`${API_CONFIG.BASE_URL}/api/inventory`);
        if (!res.ok) {
          throw new Error('Failed to fetch recommended items');
        }
        const data = await res.json();
        // Filter out current item and limit to 4 items
        const filteredItems = data.items
          .filter(item => item._id !== id)
          .slice(0, 4);
        setInventories(filteredItems);
      } catch (error) {
        console.error("Error fetching inventories:", error);
      }
    };

    if (!loading && fashionItem) {
      fetchInventories();
    }
  }, [id, loading, fashionItem]);

  // Handle quantity changes
  const handleIncrease = () => setQuantity(quantity + 1);
  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!currentUser) {
      Swal.fire({
        title: "Please log in",
        text: "You need to log in to add items to the cart.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const cartItem = {
        userId: currentUser._id,
        itemId: id,
        title: fashionItem.ItemName,
        img: fashionItem.imageUrls[0] || "",
        price: fashionItem.UnitPrice,
        quantity,
        size: selectedSize,
        color: selectedColor,
      };

      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      cart.push(cartItem);
      localStorage.setItem("cart", JSON.stringify(cart));

      Swal.fire({
        title: "Item added to cart successfully!",
        text: "Would you like to view your cart or add more items?",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Go to Cart",
        cancelButtonText: "Add More",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/cart";
        }
      });
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "An error occurred while adding the item to the cart. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  // Handle size and color changes
  const handleSizeChange = (e) => setSelectedSize(e.target.value);
  const handleColorChange = (color) => setSelectedColor(color);

  // If there's an error, show it with a retry button
  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Back to Products
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="mb-8 flex items-center text-purple-600 hover:text-purple-800 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </button>
        {loading ? (
          <div className="flex justify-center items-center h-screen">
            <TailSpin height="80" width="80" color="#a98467" ariaLabel="loading" />
          </div>
        ) : error ? (
          <div className="text-center text-red-600">Error: {error}</div>
        ) : fashionItem ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="relative">
              <img
                src={fashionItem.image ? `${API_CONFIG.BASE_URL}/${fashionItem.image}` : "/default-img.jpg"}
                alt={fashionItem.ItemName}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">{fashionItem.ItemName}</h1>
              <p className="text-gray-600">{fashionItem.Description}</p>
              
              {/* Price */}
              <div className="text-2xl font-semibold text-purple-800">
                ${(fashionItem.finalPrice || fashionItem.unitPrice || 0).toFixed(2)}
              </div>

              {/* Size Selection */}
              {fashionItem.Sizes && fashionItem.Sizes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Size</label>
                  <select
                    value={selectedSize}
                    onChange={handleSizeChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                  >
                    {fashionItem.Sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Color Selection */}
              {fashionItem.Colors && fashionItem.Colors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Color</label>
                  <div className="mt-2 flex space-x-2">
                    {fashionItem.Colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className={`w-8 h-8 rounded-full border-2 ${
                          selectedColor === color
                            ? 'border-purple-500'
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <div className="mt-2 flex items-center space-x-4">
                  <button
                    onClick={handleDecrease}
                    className="p-2 border rounded-md hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="text-lg font-medium">{quantity}</span>
                  <button
                    onClick={handleIncrease}
                    className="p-2 border rounded-md hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700 transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-600">Product not found</div>
        )}

        {/* Recommended Products */}
        {inventories.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {inventories.map((item) => (
                <ProductCard
                  key={item._id}
                  id={item._id}
                  img={item.image ? `${API_CONFIG.BASE_URL}/${item.image}` : "/default-img.jpg"}
                  name={item.ItemName}
                  price={item.finalPrice || item.unitPrice}
                  category={item.Category}
                  brand={item.Brand}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default FashionItem;
