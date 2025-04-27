import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import LoadingSpinner from "../../components/Spinner";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaBox, FaStar, FaEye } from "react-icons/fa";
import API_CONFIG from '../../config/apiConfig.js';

const FeedbackPopup = ({ order, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Swal.fire("Error", "Please provide a rating", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(API_CONFIG.ENDPOINTS.FEEDBACK.CREATE, {
        userId: order.userId,
        orderId: order._id,
        items: order.items, // Send the entire items array
        rating,
        comment: description,
      });
      Swal.fire("Success", "Feedback submitted successfully", "success");
      onSubmit();
      onClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      Swal.fire("Error", "Failed to submit feedback", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-lg w-full">
        <h2 className="text-2xl font-bold text-DarkColor mb-4">Submit Feedback</h2>
        <div className="space-y-4">
          <div>
            <label className="text-gray-600 font-medium">Username:</label>
            <p className="text-DarkColor">{order.customerInfo.name}</p>
          </div>
          <div>
            <label className="text-gray-600 font-medium">Order ID:</label>
            <p className="text-DarkColor">{order.orderId}</p>
          </div>
          <div>
            <label className="text-gray-600 font-medium">Order Date:</label>
            <p className="text-DarkColor">
              {new Date(order.createdAt).toLocaleDateString()} at{" "}
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <div>
            <label className="text-gray-600 font-medium">Items:</label>
            <ul className="list-disc pl-5">
              {order.items.map((item) => (
                <li key={item.itemId} className="text-DarkColor">
                  {item.title} (Size: {item.size}, Qty: {item.quantity}, Price: ${item.price.toFixed(2)})
                </li>
              ))}
            </ul>
          </div>
          <div>
            <label className="text-gray-600 font-medium">Rating:</label>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={`cursor-pointer text-2xl ${
                    star <= rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="text-gray-600 font-medium">Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-SecondaryColor/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-SecondaryColor mt-2"
              rows="4"
              placeholder="Your feedback..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-DarkColor rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 bg-SecondaryColor text-white rounded-lg hover:bg-SecondaryColor/80 transition-colors ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?._id) {
        console.log("No user ID found, skipping fetch.");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching orders for user:", currentUser._id);
        const ordersResponse = await axios.get(`/api/orders/get/${currentUser._id}`);
        console.log("Orders response:", ordersResponse.data);
        setOrders(ordersResponse.data);

        console.log("Fetching feedback for user:", currentUser._id);
        const feedbackResponse = await axios.get(`/api/feedbacks/${currentUser._id}`);
        console.log("Feedback response:", feedbackResponse.data);
        setFeedbacks(feedbackResponse.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire("Error", "Failed to fetch data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser?._id]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleOpenFeedbackPopup = (order) => {
    setSelectedOrder(order);
    setShowFeedbackPopup(true);
  };

  const handleViewFeedback = () => {
    navigate("/profile");
  };

  const hasFeedback = (orderId) => {
    return feedbacks.some((feedback) => feedback.orderId._id === orderId);
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) &&
      order.status === "Delivered"
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-PrimaryColor/30 min-h-screen">
      <Navbar />
      <div className="p-6 w-full lg:w-3/4 mx-auto pt-24">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-DarkColor">My Orders</h1>
        <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Order ID"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full p-3 pl-10 border border-SecondaryColor/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-SecondaryColor bg-white shadow-sm"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-SecondaryColor" />
              </div>
            </div>
            {/* {feedbacks.length > 0 && (
              <button
                onClick={handleViewFeedback}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FaEye /> View My Feedback
              </button>
            )} */}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white border border-SecondaryColor/20 p-6 rounded-2xl shadow-md relative"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-PrimaryColor p-3 rounded-xl mr-4">
                        <FaBox className="text-DarkColor text-xl" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-DarkColor">
                          Order #{order.orderId}
                        </h2>
                        <p className="text-gray-500 text-sm">
                          {new Date(order.createdAt).toLocaleDateString()} at{" "}
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap gap-4 mt-4">
                      {order.items.map((item) => (
                        <div
                          key={item.itemId}
                          className="text-left flex items-center bg-PrimaryColor/20 p-3 rounded-xl w-full"
                        >
                          <img
                            src={item.img}
                            alt={item.title}
                            className="w-16 h-16 object-cover rounded-lg shadow-md mr-4"
                          />
                          <div>
                            <p className="text-DarkColor font-medium text-sm">
                              {item.title}
                            </p>
                            <div className="flex items-center text-xs text-gray-600 mt-1">
                              <span>Size: {item.size}</span>
                              <span className="mx-2">•</span>
                              <span className="flex items-center">
                                Color:
                                <span
                                  style={{ backgroundColor: item.color }}
                                  className="inline-block w-4 h-4 rounded-full ml-1 border border-gray-200"
                                />
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <p className="text-DarkColor font-semibold">
                        Total: ${order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {order.status === "Delivered" && (
                    <div className="flex justify-end mt-4 gap-3">
                      {!hasFeedback(order._id) ? (
                        <button
                          onClick={() => handleOpenFeedbackPopup(order)}
                          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <FaStar /> Add Feedback
                        </button>
                      ) : (
                        <button
                          onClick={handleViewFeedback}
                          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <FaEye /> View Feedback
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white p-8 rounded-2xl shadow-md text-center col-span-full">
                <div className="w-20 h-20 mx-auto mb-4 bg-PrimaryColor rounded-full flex items-center justify-center">
                  <FaBox className="text-DarkColor text-2xl" />
                </div>
                <h3 className="text-xl font-medium text-DarkColor mb-2">
                  No Delivered Orders Found
                </h3>
                <p className="text-gray-500">
                  You don't have any Delivered orders that match your search criteria.
                </p>
              </div>
            )}
          </div>
        )}

        {showFeedbackPopup && (
          <FeedbackPopup
            order={selectedOrder}
            onClose={() => setShowFeedbackPopup(false)}
            onSubmit={() => {
              setShowFeedbackPopup(false);
              axios.get(`/api/feedbacks/${currentUser._id}`)
                .then((response) => setFeedbacks(response.data.data))
                .catch((error) => console.error("Error refreshing feedbacks:", error));
            }}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyOrders;