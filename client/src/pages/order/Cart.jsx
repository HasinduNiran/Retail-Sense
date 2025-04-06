import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import axios from "axios";
import LoadingSpinner from "../../components/Spinner";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [promoError, setPromoError] = useState("");
  const [activePromotion, setActivePromotion] = useState(null);
  const [itemDiscounts, setItemDiscounts] = useState({});
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const cartData = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(cartData);
    calculateSubtotal(cartData);
    setIsLoading(false);
  }, []);

  const calculateSubtotal = (items) => {
    const total = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setSubtotal(total);
  };

  const handleRemoveItem = (itemId) => {
    const updatedCart = cartItems.filter((item) => item.itemId !== itemId);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    calculateSubtotal(updatedCart);
  };

  const handleIncreaseQuantity = (itemId) => {
    const updatedCart = cartItems.map((item) =>
      item.itemId === itemId ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    calculateSubtotal(updatedCart);
    // Reset promotion when quantity changes
    setPromoCode("");
    setDiscount(0);
    setActivePromotion(null);
    setItemDiscounts({});
    setPromoError("");
  };

  const handleDecreaseQuantity = (itemId) => {
    const updatedCart = cartItems.map((item) =>
      item.itemId === itemId && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    calculateSubtotal(updatedCart);
    // Reset promotion when quantity changes
    setPromoCode("");
    setDiscount(0);
    setActivePromotion(null);
    setItemDiscounts({});
    setPromoError("");
  };

  const handleApplyPromo = async () => {
    try {
      setIsLoading(true);
      setPromoError("");
      const response = await axios.get(`http://localhost:3000/api/promotions/code/${promoCode}`);
      const promotion = response.data.data;

      if (!promotion) {
        setPromoError("Invalid promotion code");
        setDiscount(0);
        setActivePromotion(null);
        return;
      }

      // Check if promotion is still valid
      const now = new Date();
      const validUntil = new Date(promotion.validUntil);
      if (now > validUntil) {
        setPromoError("Promotion has expired");
        setDiscount(0);
        setActivePromotion(null);
        return;
      }

      // Check minimum purchase requirement
      if (subtotal < promotion.minimumPurchase) {
        setPromoError(`Minimum purchase of Rs. ${promotion.minimumPurchase} required`);
        setDiscount(0);
        setActivePromotion(null);
        return;
      }

      // Calculate discount based on type and apply to each applicable item
      let totalDiscount = 0;
      const newItemDiscounts = {};

      for (const item of cartItems) {
        const isApplicable = promotion.applicableProducts.includes(item.itemId) ||
          promotion.applicableCategories.includes(item.category);

        if (isApplicable) {
          let itemDiscount = 0;
          if (promotion.discountType === 'flat') {
            itemDiscount = promotion.discountValue * item.quantity;
          } else if (promotion.discountType === 'percentage') {
            itemDiscount = (item.price * item.quantity * promotion.discountPercentage) / 100;
          }
          newItemDiscounts[item.itemId] = {
            discountPerItem: promotion.discountType === 'flat' ? promotion.discountValue : (item.price * promotion.discountPercentage) / 100,
            totalDiscount: itemDiscount,
            quantity: item.quantity,
            promoCode: promotion.promoCode
          };
          totalDiscount += itemDiscount;
        }
      }

      setDiscount(totalDiscount);
      setActivePromotion(promotion);
      setItemDiscounts(newItemDiscounts);
    } catch (error) {
      console.error('Error applying promotion:', error);
      setPromoError("Error applying promotion code");
      setDiscount(0);
      setActivePromotion(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = () => {
    const checkoutData = {
      userId: currentUser._id,
      items: cartItems,
      total: subtotal - discount,
      promoCode: activePromotion?.promoCode || null
    };
    navigate("/checkout", { state: checkoutData });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen p-8 flex flex-col items-center">
        <div className="w-full lg:w-3/4 flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-10 mt-20">
          <div className="w-full lg:w-2/3 space-y-6">
            <h1 className="text-3xl font-semibold mb-4">Your Fashion Cart</h1>
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <motion.div
                  key={item.itemId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-4 border-b"
                >
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-16 rounded"
                  />
                  <div className="flex-1 px-4">
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="text-gray-600">Price: Rs. {item.price}</p>
                    {itemDiscounts[item.itemId] && (
                      <p className="text-green-500">
                        Promo {itemDiscounts[item.itemId].promoCode}:
                        {itemDiscounts[item.itemId].discountPerItem.toFixed(2)} × {itemDiscounts[item.itemId].quantity} = 
                        Rs. {itemDiscounts[item.itemId].totalDiscount.toFixed(2)} off
                      </p>
                    )}
                    <p className="text-gray-600">Size: {item.size}</p>
                    <p className="text-gray-600">
                      Color:{" "}
                      <span
                        style={{
                          backgroundColor: item.color,
                          color: item.color,
                        }}
                        className="w-8 h-8 rounded-full text-xs"
                      >
                        ws
                      </span>
                    </p>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleDecreaseQuantity(item.itemId)}
                        className="text-gray-500 border px-2 rounded hover:bg-gray-200"
                      >
                        -
                      </button>
                      <span>Quantity: {item.quantity}</span>
                      <button
                        onClick={() => handleIncreaseQuantity(item.itemId)}
                        className="text-gray-500 border px-2 rounded hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-gray-800 font-semibold">
                      Total: Rs. {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.itemId)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </motion.div>
              ))
            ) : (
              <p>Your cart is empty.</p>
            )}
          </div>

          <div className="w-full lg:w-1/3 p-6 bg-gray-100 rounded-lg space-y-4">
            <h2 className="text-2xl font-semibold">Order Summary</h2>
            {cartItems.map((item) => (
              <div
                key={item.itemId}
                className="flex justify-between items-center"
              >
                <span className="font-semibold">{item.title}</span>
                <span>{item.quantity}</span>
                <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <hr className="my-4" />
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-Rs. {discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Total:</span>
              <span>Rs. {activePromotion ? (subtotal - discount).toFixed(2) : subtotal.toFixed(2)}</span>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Enter Promo Code for Discount"
                className="w-full p-2 border rounded"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              {!promoCode && (
                <p className="text-gray-500 text-sm mt-1">
                  Add a promo code to get discounts on applicable items
                </p>
              )}
              {promoError && (
                <p className="text-red-500 text-sm">{promoError}</p>
              )}
              {activePromotion && (
                <p className="text-green-500 text-sm">
                  {activePromotion.discountType === 'percentage'
                    ? `${activePromotion.discountPercentage}% off`
                    : `Rs. ${discount} off (${activePromotion.discountValue} × ${cartItems.reduce((sum, item) => {
                        const isApplicable = activePromotion.applicableProducts.includes(item.itemId) ||
                          activePromotion.applicableCategories.includes(item.category);
                        return sum + (isApplicable ? item.quantity : 0);
                      }, 0)} items)`}
                </p>
              )}
              <button
                onClick={handleApplyPromo}
                disabled={!promoCode || isLoading}
                className={`w-full py-2 rounded transition duration-300 ${!promoCode || isLoading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
              >
                {isLoading ? 'Applying...' : 'Apply Promo Code'}
              </button>
            </div>
            <button
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-300"
              onClick={handleCheckout}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
