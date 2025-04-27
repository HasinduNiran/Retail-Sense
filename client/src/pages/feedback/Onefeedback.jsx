import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from "../../components/Spinner";
import { useSelector } from "react-redux";
import { FaBox, FaStar, FaEdit, FaTrash } from "react-icons/fa";
import API_CONFIG from '../../config/apiConfig.js';

const EditFeedbackPopup = ({ feedback, onClose, onUpdate }) => {
  const [rating, setRating] = useState(parseInt(feedback.rating, 10));
  const [comment, setComment] = useState(feedback.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Swal.fire("Error", "Please provide a rating", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.put(`/api/feedbacks/${feedback._id}`, {
        userId: feedback.userId,
        orderId: feedback.orderId._id,
        items: feedback.items,
        rating: rating.toString(),
        comment,
      });
      Swal.fire("Success", "Feedback updated successfully", "success");
      onUpdate(response.data.data);
      onClose();
    } catch (error) {
      console.error("Error updating feedback:", error);
      Swal.fire("Error", "Failed to update feedback", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-lg w-full">
        <h2 className="text-2xl font-bold text-DarkColor mb-4">Edit Feedback</h2>
        <div className="space-y-4">
          <div>
            <label className="text-gray-600 font-medium">Order ID:</label>
            <p className="text-DarkColor">{feedback.orderId.orderId}</p>
          </div>
          <div>
            <label className="text-gray-600 font-medium">Items:</label>
            <ul className="list-disc pl-5">
              {feedback.items.map((item, index) => (
                <li key={index} className="text-DarkColor">
                  {item.itemTitle} (Qty: {item.quantity}, Price: ${item.price.toFixed(2)})
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
            <label className="text-gray-600 font-medium">Comment:</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
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
            {isSubmitting ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Onefeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!currentUser?._id) {
        console.log("No user ID found, skipping fetch.");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching feedback for user:", currentUser._id);
        const response = await axios.get(`/api/feedbacks/${currentUser._id}`);
        console.log("Feedback response:", response.data);
        setFeedbacks(response.data.data || []);
      } catch (error) {
        console.error("Error fetching feedback:", error);
        Swal.fire("Error", "Failed to fetch feedback", "error");
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [currentUser?._id]);

  const renderStars = (rating) => {
    const stars = parseInt(rating, 10);
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`text-xl ${
              star <= stars ? "text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const handleBack = () => {
    navigate("/orders");
  };

  const handleDelete = async (feedbackId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/feedbacks/${feedbackId}`);
          setFeedbacks(feedbacks.filter((feedback) => feedback._id !== feedbackId));
          Swal.fire("Deleted!", "Your feedback has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting feedback:", error);
          Swal.fire("Error", "Failed to delete feedback", "error");
        }
      }
    });
  };

  const handleEdit = (feedback) => {
    setSelectedFeedback(feedback);
    setShowEditPopup(true);
  };

  const handleUpdateFeedback = (updatedFeedback) => {
    setFeedbacks(
      feedbacks.map((feedback) =>
        feedback._id === updatedFeedback._id ? updatedFeedback : feedback
      )
    );
  };

  return (
    <div className="bg-PrimaryColor/30 min-h-screen">
      <div className="p-6 w-full lg:w-3/4 mx-auto pt-2">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-DarkColor">My Feedback</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {feedbacks.length > 0 ? (
              feedbacks.map((feedback) => (
                <div
                  key={feedback._id}
                  className="bg-white border border-SecondaryColor/20 p-6 rounded-2xl shadow-md w-full max-w-md mx-auto"
                >
                  {/* Order Details */}
                  {feedback.orderId ? (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="bg-PrimaryColor p-3 rounded-xl mr-4">
                            <FaBox className="text-DarkColor text-xl" />
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold text-DarkColor">
                              Order #{feedback.orderId.orderId}
                            </h2>
                            <p className=" Þtext-gray-500 text-xs">
                              {new Date(feedback.orderDate).toLocaleDateString()} at{" "}
                              {new Date(feedback.orderDate).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex flex-wrap gap-3 mt-3">
                          {feedback.items && feedback.items.length > 0 ? (
                            feedback.items.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center bg-PrimaryColor/20 p-2 rounded-xl w-full"
                              >
                                <img
                                  src={item.img}
                                  alt={item.itemTitle}
                                  className="w-12 h-12 object-cover rounded-lg shadow-md mr-3"
                                />
                                <div>
                                  <p className="text-DarkColor font-medium text-sm">
                                    {item.itemTitle}
                                  </p>
                                  <div className="flex items-center text-xs text-gray-600 mt-1">
                                    <span>Qty: {item.quantity}</span>
                                    <span className="mx-1">•</span>
                                    <span>Price: ${item.price.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm">No items available for this feedback.</p>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="mb-3">
                      <p className="text-red-500 text-sm">Associated order not found.</p>
                    </div>
                  )}

                  {/* Feedback Details */}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <h3 className="text-base font-semibold text-DarkColor mb-2">Feedback</h3>
                    <div className="space-y-1">
                      <div>
                        <label className="text-gray-600 font-medium text-sm">Order ID:</label>
                        <p className="text-DarkColor text-sm">
                          {feedback.orderId ? feedback.orderId.orderId : "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-600 font-medium text-sm">Rating:</label>
                        {renderStars(feedback.rating)}
                      </div>
                      <div>
                        <label className="text-gray-600 font-medium text-sm">Comment:</label>
                        <p className="text-DarkColor text-sm">{feedback.comment || "No comment provided"}</p>
                      </div>
                      <div className="flex justify-end gap-2 mt-3">
                        <button
                          onClick={() => handleEdit(feedback)}
                          className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition-colors text-sm"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(feedback._id)}
                          className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition-colors text-sm"
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-8 rounded-2xl shadow-md text-center col-span-full max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-4 bg-PrimaryColor rounded-full flex items-center justify-center">
                  <FaStar className="text-DarkColor text-2xl" />
                </div>
                <h3 className="text-xl font-medium text-DarkColor mb-2">
                  No Feedback Found
                </h3>
                <p className="text-gray-500">
                  You haven't submitted any feedback yet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {showEditPopup && (
        <EditFeedbackPopup
          feedback={selectedFeedback}
          onClose={() => setShowEditPopup(false)}
          onUpdate={handleUpdateFeedback}
        />
      )}
    </div>
  );
};

export default Onefeedback;