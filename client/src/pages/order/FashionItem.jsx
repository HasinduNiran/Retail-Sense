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

  // Parse arrays from server response
  const parseSizes = (sizes) => {
    if (!sizes) return [];
    try {
      // If it's already an array, clean and return it
      if (Array.isArray(sizes)) {
        return sizes.map(s => s.replace(/["\[\]]/g, '').trim());
      }
      // Try parsing as JSON
      const parsed = JSON.parse(sizes);
      if (Array.isArray(parsed)) {
        return parsed.map(s => s.replace(/["\[\]]/g, '').trim());
      }
      // Split by comma if it's a string
      return sizes
        .replace(/["\[\]]/g, '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    } catch {
      return sizes
        .replace(/["\[\]]/g, '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    }
  };

  const parseColors = (colors) => {
    if (!colors) return [];
    try {
      // If it's already an array, clean and return it
      if (Array.isArray(colors)) {
        return colors.map(c => c.replace(/["\[\]]/g, '').trim());
      }
      // Try parsing as JSON
      const parsed = JSON.parse(colors);
      if (Array.isArray(parsed)) {
        return parsed.map(c => c.replace(/["\[\]]/g, '').trim());
      }
      // Split by comma if it's a string
      return colors
        .replace(/["\[\]]/g, '')
        .split(',')
        .map(c => c.trim())
        .filter(c => c.startsWith('#') || isValidColorName(c));
    } catch {
      return colors
        .replace(/["\[\]]/g, '')
        .split(',')
        .map(c => c.trim())
        .filter(c => c.startsWith('#') || isValidColorName(c));
    }
  };

  // Helper function to validate color names
  const isValidColorName = (color) => {
    const validColors = [
      'black', 'white', 'red', 'green', 'blue', 'yellow', 'purple', 'orange',
      'pink', 'brown', 'gray', 'navy', 'teal', 'maroon', 'olive'
    ];
    return validColors.includes(color.toLowerCase());
  };

  // Convert color name to hex
  const getColorValue = (color) => {
    if (color.startsWith('#')) return color;
    
    // Create a temporary element to convert color names to hex
    const tempEl = document.createElement('div');
    tempEl.style.color = color;
    document.body.appendChild(tempEl);
    const computedColor = window.getComputedStyle(tempEl).color;
    document.body.removeChild(tempEl);
    
    // Convert rgb to hex
    if (computedColor.startsWith('rgb')) {
      const [r, g, b] = computedColor.match(/\d+/g);
      return `#${[r, g, b].map(x => parseInt(x).toString(16).padStart(2, '0')).join('')}`;
    }
    
    return color;
  };

  // Fetch item data from backend API
  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching item with ID:', id);
        
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/inventory/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch item data (Status: ${response.status})`);
        }
        
        const data = await response.json();
        console.log('Fetched item data:', data);
        
        if (!data) {
          throw new Error('No data received from server');
        }

        // Parse sizes and colors
        const parsedSizes = parseSizes(data.Sizes);
        const parsedColors = parseColors(data.Colors);
        
        setFashionItem({
          ...data,
          Sizes: parsedSizes,
          Colors: parsedColors
        });
        
        // Set initial selections
        setSelectedSize(parsedSizes[0] || "");
        setSelectedColor(parsedColors[0] || "");
        
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
        img: fashionItem.image ? `${API_CONFIG.BASE_URL}/${fashionItem.image}` : "/default-img.jpg",
        price: fashionItem.finalPrice || fashionItem.unitPrice,
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
    } catch {
      Swal.fire({
        title: "Error!",
        text: "An error occurred while adding the item to the cart. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  // If there's an error, show it with a retry button
  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-PrimaryColor flex flex-col items-center justify-center px-4">
          <div className="text-center bg-white p-8 rounded-2xl shadow-xl border-2 border-SecondaryColor">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-SecondaryColor text-white px-6 py-2 rounded-md hover:bg-DarkColor transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-DarkColor text-white px-6 py-2 rounded-md hover:opacity-90 transition-colors"
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
      <div className="min-h-screen bg-PrimaryColor py-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate('/')}
            className="mb-8 flex items-center text-DarkColor hover:text-SecondaryColor transition-colors"
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
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-SecondaryColor">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={fashionItem.image ? `${API_CONFIG.BASE_URL}/${fashionItem.image}` : "/default-img.jpg"}
                    alt={fashionItem.ItemName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Product Details */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-SecondaryColor space-y-6">
                <h1 className="text-3xl font-bold text-DarkColor">{fashionItem.ItemName}</h1>
                <p className="text-gray-600">{fashionItem.Description}</p>
                
                {/* Price */}
                <div className="text-2xl font-semibold text-DarkColor">
                  ${(fashionItem.finalPrice || fashionItem.unitPrice || 0).toFixed(2)}
                </div>

                {/* Size Selection */}
                {fashionItem.Sizes && fashionItem.Sizes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-DarkColor mb-2">Size</label>
                    <div className="flex flex-wrap gap-2">
                      {fashionItem.Sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                            ${selectedSize === size
                              ? 'bg-DarkColor text-white'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                        >
                          {size.replace(/["\[\]]/g, '')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {fashionItem.Colors && fashionItem.Colors.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-DarkColor mb-2">Color</label>
                    <div className="flex flex-wrap gap-3">
                      {fashionItem.Colors.map((color) => {
                        const colorValue = getColorValue(color);
                        return (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`w-10 h-10 rounded-full transition-transform hover:scale-110
                              ${selectedColor === color 
                                ? 'ring-2 ring-offset-2 ring-SecondaryColor transform scale-110' 
                                : 'ring-1 ring-gray-300'
                              }`}
                            style={{ 
                              backgroundColor: colorValue,
                              boxShadow: selectedColor === color ? '0 0 0 2px white' : 'none'
                            }}
                            title={color}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-DarkColor">Quantity</label>
                  <div className="mt-2 flex items-center space-x-4">
                    <button
                      onClick={handleDecrease}
                      className="p-2 border rounded-md hover:bg-PrimaryColor"
                    >
                      -
                    </button>
                    <span className="text-lg font-medium">{quantity}</span>
                    <button
                      onClick={handleIncrease}
                      className="p-2 border rounded-md hover:bg-PrimaryColor"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-SecondaryColor text-white py-3 px-6 rounded-md hover:bg-DarkColor transition-colors"
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
              <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-md border-2 border-SecondaryColor mb-6 w-fit">
                <div className="bg-PrimaryColor p-1.5 rounded-full mr-2 border-2 border-SecondaryColor">
                  <svg className="text-DarkColor w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-DarkColor">You May Also Like</h2>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-SecondaryColor">
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
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FashionItem;
